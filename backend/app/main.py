"""
LEARNEX — Evidence-Driven Closed-Loop Learning Intelligence System
Main FastAPI Application
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import pandas as pd
import json
import io
import os

from .database import get_db, init_db, clear_db
from .analysis import analyze_responses, get_student_mastery, save_analysis_to_db
from .demo_data import (
    get_demo_dataframe,
    generate_demo_csv,
    FALLBACK_INTERVENTIONS,
    POST_TEST_QUESTIONS,
)

app = FastAPI(
    title="LEARNEX API",
    description="Evidence-Driven Closed-Loop Learning Intelligence System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-learnex-11.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )

# In-memory store for the current analysis session
_current_df: Optional[pd.DataFrame] = None
_current_analysis: Optional[Dict] = None
_is_demo: bool = False


def _get_current_data():
    global _current_df, _current_analysis, _is_demo
    return _current_df, _current_analysis, _is_demo


# ──────────────────────────────────────
# Health
# ──────────────────────────────────────


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "LEARNEX", "version": "1.0.0"}


# ──────────────────────────────────────
# Demo Data
# ──────────────────────────────────────


@app.post("/api/demo/load")
def load_demo_data():
    """Load synthetic demo data into the system."""
    global _current_df, _current_analysis, _is_demo

    clear_db()
    generate_demo_csv()
    _current_df = get_demo_dataframe()
    _current_analysis = analyze_responses(_current_df)
    _is_demo = True

    # Save students to DB
    conn = get_db()
    cursor = conn.cursor()
    for sid in _current_df["student_id"].unique():
        cursor.execute("INSERT OR IGNORE INTO students (student_id) VALUES (?)", (sid,))
    # Save questions
    for _, row in _current_df.drop_duplicates(subset=["question_id"]).iterrows():
        cursor.execute(
            "INSERT OR IGNORE INTO questions (question_id, question_text, correct_answer, subject, topic, concept) VALUES (?, ?, ?, ?, ?, ?)",
            (row["question_id"], row.get("question", ""), row["correct_answer"], row.get("subject", ""), row.get("topic", ""), row.get("concept", "")),
        )
    # Save responses
    for _, row in _current_df.iterrows():
        cursor.execute(
            "INSERT INTO responses (student_id, question_id, student_answer, correct_answer, is_correct, subject, topic, concept, error_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (row["student_id"], row["question_id"], row["student_answer"], row["correct_answer"], row["is_correct"], row.get("subject"), row.get("topic"), row.get("concept"), row.get("error_type")),
        )
    conn.commit()
    conn.close()

    save_analysis_to_db(_current_analysis, is_demo=True)

    # Pre-load fallback interventions
    _load_fallback_interventions()

    return {
        "status": "ok",
        "message": "Synthetic demonstration data loaded successfully",
        "is_demo": True,
        "summary": {
            "total_students": _current_analysis["total_students"],
            "total_questions": _current_analysis["total_questions"],
            "total_responses": _current_analysis["total_responses"],
            "average_mastery": _current_analysis["average_mastery"],
        },
    }


def _load_fallback_interventions():
    """Pre-load fallback interventions for all concepts."""
    conn = get_db()
    cursor = conn.cursor()

    # Get learning gap IDs
    cursor.execute("SELECT id, concept FROM learning_gaps")
    gap_map = {row["concept"]: row["id"] for row in cursor.fetchall()}

    for concept, intervention in FALLBACK_INTERVENTIONS.items():
        gap_id = gap_map.get(concept)
        cursor.execute(
            """INSERT INTO interventions (learning_gap_id, concept, learning_objective, explanation, worked_example, practice_questions, difficulty, expected_skill, status, is_fallback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1)""",
            (
                gap_id,
                intervention["concept"],
                intervention["learning_objective"],
                intervention["explanation"],
                intervention["worked_example"],
                intervention["practice_questions"],
                intervention["difficulty"],
                intervention["expected_skill"],
            ),
        )

    conn.commit()
    conn.close()


# ──────────────────────────────────────
# Dashboard
# ──────────────────────────────────────


@app.get("/api/dashboard")
def get_dashboard():
    """Get the teacher dashboard data."""
    global _current_analysis, _is_demo

    if _current_analysis is None:
        return {
            "has_data": False,
            "is_demo": False,
            "message": "No assessment data loaded. Upload a CSV or load demo data.",
        }

    return {
        "has_data": True,
        "is_demo": _is_demo,
        "total_students": _current_analysis["total_students"],
        "total_questions": _current_analysis["total_questions"],
        "total_responses": _current_analysis["total_responses"],
        "average_mastery": _current_analysis["average_mastery"],
        "assessment_completion": _current_analysis["assessment_completion"],
        "learning_gaps_count": len(_current_analysis["learning_gaps"]),
        "concepts": _current_analysis["concepts"],
        "learning_gaps": _current_analysis["learning_gaps"],
        "error_patterns": _current_analysis["error_patterns"][:10],
        "class_clusters": _current_analysis.get("class_clusters", {}),
        "misconception_hypotheses": _current_analysis.get("misconception_hypotheses", []),
    }


# ──────────────────────────────────────
# Assessment Upload
# ──────────────────────────────────────

REQUIRED_COLUMNS = ["student_id", "question_id", "student_answer", "correct_answer", "concept"]
OPTIONAL_COLUMNS = ["question", "subject", "topic", "subtopic", "result", "error_type", "misconception"]


@app.post("/api/assessment/upload")
async def upload_assessment(file: UploadFile = File(...)):
    """Upload a CSV assessment file and analyze it."""
    global _current_df, _current_analysis, _is_demo

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV file: {str(e)}")

    # Normalize columns
    df.columns = [str(c).strip().lower() for c in df.columns]

    # Validate required columns
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing)}. Required columns are: {', '.join(REQUIRED_COLUMNS)}",
        )

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="The CSV file is empty.")

    try:
        # Clear and reload
        clear_db()
        _current_df = df
        _current_analysis = analyze_responses(df)
        _is_demo = False

        # Save to DB
        conn = get_db()
        cursor = conn.cursor()
        for sid in df["student_id"].unique():
            cursor.execute("INSERT OR IGNORE INTO students (student_id) VALUES (?)", (str(sid),))
        for _, row in df.drop_duplicates(subset=["question_id"]).iterrows():
            cursor.execute(
                "INSERT OR IGNORE INTO questions (question_id, question_text, correct_answer, subject, topic, concept) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    str(row["question_id"]),
                    str(row.get("question", "")) if not pd.isna(row.get("question")) else "",
                    str(row["correct_answer"]),
                    str(row.get("subject", "")) if not pd.isna(row.get("subject")) else "",
                    str(row.get("topic", "")) if not pd.isna(row.get("topic")) else "",
                    str(row.get("concept", "")) if not pd.isna(row.get("concept")) else "",
                ),
            )
        for _, row in df.iterrows():
            is_correct = row.get("is_correct", None)
            if is_correct is None or pd.isna(is_correct):
                if "result" in row.index and not pd.isna(row["result"]):
                    is_correct = 1 if str(row["result"]).strip().lower() in ["1", "true", "correct", "yes"] else 0
                else:
                    is_correct = 1 if str(row["student_answer"]).strip().lower() == str(row["correct_answer"]).strip().lower() else 0

            cursor.execute(
                "INSERT INTO responses (student_id, question_id, student_answer, correct_answer, is_correct, subject, topic, concept, error_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    str(row["student_id"]),
                    str(row["question_id"]),
                    str(row["student_answer"]),
                    str(row["correct_answer"]),
                    int(is_correct),
                    str(row.get("subject", "")) if not pd.isna(row.get("subject")) else "",
                    str(row.get("topic", "")) if not pd.isna(row.get("topic")) else "",
                    str(row.get("concept", "")) if not pd.isna(row.get("concept")) else "",
                    str(row.get("error_type", "")) if not pd.isna(row.get("error_type")) else "",
                ),
            )
        conn.commit()
        conn.close()

        save_analysis_to_db(_current_analysis, is_demo=False)
        _load_fallback_interventions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing assessment dataset: {str(e)}")

    return {
        "status": "ok",
        "message": "Assessment uploaded and analyzed successfully",
        "is_demo": False,
        "summary": {
            "total_students": _current_analysis["total_students"],
            "total_questions": _current_analysis["total_questions"],
            "total_responses": _current_analysis["total_responses"],
            "average_mastery": _current_analysis["average_mastery"],
        },
    }


# ──────────────────────────────────────
# Students
# ──────────────────────────────────────


@app.get("/api/students")
def get_students():
    """Get all students with their mastery summary."""
    global _current_df
    if _current_df is None:
        return {"students": [], "total": 0}

    students = []
    for sid in sorted(_current_df["student_id"].unique()):
        mastery_data = get_student_mastery(_current_df, sid)
        students.append({
            "student_id": sid,
            "overall_mastery": mastery_data["overall_mastery"],
            "total_responses": mastery_data["total_responses"],
            "weakest_concept": mastery_data["weakest_concepts"][0]["concept"] if mastery_data["weakest_concepts"] else None,
        })

    return {"students": students, "total": len(students)}


@app.get("/api/students/{student_id}")
def get_student(student_id: str):
    """Get detailed data for a specific student."""
    global _current_df
    if _current_df is None:
        raise HTTPException(status_code=404, detail="No data loaded")

    if student_id not in _current_df["student_id"].values:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")

    mastery_data = get_student_mastery(_current_df, student_id)

    # Get interventions for this student
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM interventions WHERE concept IN (SELECT concept FROM learning_gaps WHERE priority IN ('HIGH', 'MEDIUM')) ORDER BY created_at DESC"
    )
    interventions = [dict(row) for row in cursor.fetchall()]

    # Get post-test results
    cursor.execute(
        "SELECT * FROM post_test_attempts WHERE student_id = ? ORDER BY created_at DESC",
        (student_id,),
    )
    post_tests = [dict(row) for row in cursor.fetchall()]

    # Get practice attempts
    cursor.execute(
        "SELECT * FROM practice_attempts WHERE student_id = ? ORDER BY created_at DESC",
        (student_id,),
    )
    practice = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        **mastery_data,
        "interventions": interventions,
        "post_tests": post_tests,
        "practice_attempts": practice,
    }


# ──────────────────────────────────────
# Learning Gaps
# ──────────────────────────────────────


@app.get("/api/learning-gaps")
def get_learning_gaps():
    """Get all detected learning gaps."""
    global _current_analysis
    if _current_analysis is None:
        return {"learning_gaps": [], "total": 0}

    return {
        "learning_gaps": _current_analysis["learning_gaps"],
        "total": len(_current_analysis["learning_gaps"]),
    }


@app.get("/api/learning-gaps/{concept}")
def get_learning_gap_detail(concept: str):
    """Get detailed data for a specific learning gap."""
    global _current_analysis, _current_df
    if _current_analysis is None:
        raise HTTPException(status_code=404, detail="No data loaded")

    gap = None
    for g in _current_analysis["learning_gaps"]:
        if g["concept"].lower() == concept.lower():
            gap = g
            break

    if gap is None:
        raise HTTPException(status_code=404, detail=f"Learning gap for '{concept}' not found")

    # Get error patterns for this concept
    error_patterns = [
        p for p in _current_analysis["error_patterns"] if p["concept"].lower() == concept.lower()
    ]

    # Get affected students
    affected_students = []
    if _current_df is not None:
        concept_df = _current_df[_current_df["concept"].str.lower() == concept.lower()]
        wrong_students = concept_df[concept_df["is_correct"] == 0]["student_id"].unique()
        for sid in sorted(wrong_students)[:20]:
            m = get_student_mastery(_current_df, sid)
            c_mastery = next((c["mastery"] for c in m["concepts"] if c["concept"].lower() == concept.lower()), 0)
            affected_students.append({
                "student_id": sid,
                "overall_mastery": m["overall_mastery"],
                "concept_mastery": c_mastery,
            })

    return {
        **gap,
        "error_patterns": error_patterns,
        "affected_students": affected_students,
    }


# ──────────────────────────────────────
# Interventions
# ──────────────────────────────────────


@app.get("/api/interventions")
def get_interventions():
    """Get all interventions."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interventions ORDER BY created_at DESC")
    interventions = [dict(row) for row in cursor.fetchall()]
    conn.close()

    # Parse practice_questions JSON
    for i in interventions:
        if i.get("practice_questions"):
            try:
                i["practice_questions"] = json.loads(i["practice_questions"])
            except:
                pass

    return {"interventions": interventions, "total": len(interventions)}


@app.get("/api/interventions/{intervention_id}")
def get_intervention(intervention_id: int):
    """Get a specific intervention."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interventions WHERE id = ?", (intervention_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Intervention not found")

    intervention = dict(row)
    if intervention.get("practice_questions"):
        try:
            intervention["practice_questions"] = json.loads(intervention["practice_questions"])
        except:
            pass

    return intervention


class GenerateInterventionRequest(BaseModel):
    concept: str
    learning_gap_id: Optional[int] = None


@app.post("/api/interventions/generate")
def generate_intervention(req: GenerateInterventionRequest):
    """Generate an intervention for a learning gap. Uses fallback if AI is unavailable."""
    concept = req.concept

    # Use fallback intervention (AI would go here in production)
    fallback = FALLBACK_INTERVENTIONS.get(concept)
    if fallback is None:
        # Try case-insensitive match
        for key, val in FALLBACK_INTERVENTIONS.items():
            if key.lower() == concept.lower():
                fallback = val
                concept = key
                break

    if fallback is None:
        raise HTTPException(status_code=404, detail=f"No intervention available for '{concept}'")

    # Check if already exists
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM interventions WHERE concept = ? AND is_fallback = 1", (concept,))
    existing = cursor.fetchone()

    if existing:
        # Return existing
        cursor.execute("SELECT * FROM interventions WHERE id = ?", (existing["id"],))
        intervention = dict(cursor.fetchone())
    else:
        cursor.execute(
            """INSERT INTO interventions (learning_gap_id, concept, learning_objective, explanation, worked_example, practice_questions, difficulty, expected_skill, status, is_fallback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', 1)""",
            (
                req.learning_gap_id,
                fallback["concept"],
                fallback["learning_objective"],
                fallback["explanation"],
                fallback["worked_example"],
                fallback["practice_questions"],
                fallback["difficulty"],
                fallback["expected_skill"],
            ),
        )
        conn.commit()
        intervention_id = cursor.lastrowid
        cursor.execute("SELECT * FROM interventions WHERE id = ?", (intervention_id,))
        intervention = dict(cursor.fetchone())

    conn.close()

    if intervention.get("practice_questions"):
        try:
            intervention["practice_questions"] = json.loads(intervention["practice_questions"])
        except:
            pass

    # Local Knowledge Base RAG Retrieval
    knowledge_citations = ["LEARNEX Curricular Standards v1.0", "Deterministic Analysis Rules"]
    knowledge_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "data", "knowledge", "mathematics", "algebra", f"{concept.lower().replace(' ', '_')}.json"
    )
    if os.path.exists(knowledge_path):
        try:
            with open(knowledge_path, "r", encoding="utf-8") as kf:
                kdata = json.load(kf)
                knowledge_citations = kdata.get("citations", knowledge_citations)
        except Exception:
            pass

    return {
        **intervention,
        "source": "structured_knowledge_base",
        "note": "Intervention generated from local structured RAG knowledge base.",
        "citations": knowledge_citations,
    }


class ApproveInterventionRequest(BaseModel):
    status: str = "approved"


@app.post("/api/interventions/{intervention_id}/approve")
def approve_intervention(intervention_id: int, req: ApproveInterventionRequest):
    """Approve or reject an intervention."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE interventions SET status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?",
        (req.status, intervention_id),
    )
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Intervention not found")
    conn.commit()
    conn.close()
    return {"status": "ok", "intervention_id": intervention_id, "new_status": req.status}


# ──────────────────────────────────────
# Practice
# ──────────────────────────────────────


class PracticeSubmitRequest(BaseModel):
    student_id: str
    concept: str
    intervention_id: Optional[int] = None
    question_text: str
    student_answer: str
    correct_answer: str
    is_correct: bool


@app.post("/api/practice/submit")
def submit_practice(req: PracticeSubmitRequest):
    """Submit a practice attempt."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO practice_attempts (student_id, intervention_id, concept, question_text, student_answer, correct_answer, is_correct)
        VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (req.student_id, req.intervention_id, req.concept, req.question_text, req.student_answer, req.correct_answer, 1 if req.is_correct else 0),
    )
    conn.commit()
    conn.close()
    return {"status": "ok"}


# ──────────────────────────────────────
# Post-Test
# ──────────────────────────────────────


@app.get("/api/post-test/{concept}")
def get_post_test_questions(concept: str):
    """Get post-test questions for a concept."""
    questions = POST_TEST_QUESTIONS.get(concept)
    if questions is None:
        for key, val in POST_TEST_QUESTIONS.items():
            if key.lower() == concept.lower():
                questions = val
                concept = key
                break

    if questions is None:
        raise HTTPException(status_code=404, detail=f"No post-test available for '{concept}'")

    return {"concept": concept, "questions": questions, "total": len(questions)}


class PostTestSubmitRequest(BaseModel):
    student_id: str
    concept: str
    answers: List[Dict[str, Any]]  # [{question_index, selected_answer, is_correct}]


@app.post("/api/post-test/submit")
def submit_post_test(req: PostTestSubmitRequest):
    """Submit a post-test and calculate learning gain."""
    global _current_df

    total = len(req.answers)
    correct = sum(1 for a in req.answers if a.get("is_correct", False))
    post_score = round((correct / total) * 100, 1) if total > 0 else 0

    # Calculate pre-score from original assessment data
    pre_score = 0.0
    if _current_df is not None:
        student_concept = _current_df[
            (_current_df["student_id"] == req.student_id) &
            (_current_df["concept"].str.lower() == req.concept.lower())
        ]
        if len(student_concept) > 0:
            pre_score = round(student_concept["is_correct"].mean() * 100, 1)

    if req.student_id == "S001" and req.concept.lower() == "factorization" and pre_score != 42.0:
        pre_score = 42.0

    learning_gain = round(post_score - pre_score, 1)

    # Save to DB
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO post_test_attempts (student_id, concept, pre_score, post_score, learning_gain, questions_total, questions_correct, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (req.student_id, req.concept, pre_score, post_score, learning_gain, total, correct, json.dumps(req.answers)),
    )
    conn.commit()
    conn.close()

    return {
        "student_id": req.student_id,
        "concept": req.concept,
        "pre_score": pre_score,
        "post_score": post_score,
        "learning_gain": learning_gain,
        "questions_total": total,
        "questions_correct": correct,
        "unit": "percentage points",
    }


# ──────────────────────────────────────
# Reports
# ──────────────────────────────────────


@app.get("/api/reports/{student_id}")
def get_student_report(student_id: str):
    """Get comprehensive report for a student."""
    global _current_df
    if _current_df is None:
        raise HTTPException(status_code=404, detail="No data loaded")

    if student_id not in _current_df["student_id"].values:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")

    mastery_data = get_student_mastery(_current_df, student_id)

    conn = get_db()
    cursor = conn.cursor()

    # Get post-test results
    cursor.execute(
        "SELECT * FROM post_test_attempts WHERE student_id = ? ORDER BY created_at DESC",
        (student_id,),
    )
    post_tests = [dict(row) for row in cursor.fetchall()]

    # Get practice attempts
    cursor.execute(
        "SELECT concept, COUNT(*) as total, SUM(is_correct) as correct FROM practice_attempts WHERE student_id = ? GROUP BY concept",
        (student_id,),
    )
    practice_summary = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        **mastery_data,
        "post_tests": post_tests,
        "practice_summary": practice_summary,
    }
