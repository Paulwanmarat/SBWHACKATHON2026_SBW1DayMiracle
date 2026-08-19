"""
LEARNEX Advanced Analysis Engine
Deterministic calculations for:
- Student Knowledge Profile
- Weighted Mastery Model & Confidence Estimation
- Concept Dependency Graph & Downstream Impact
- Error Pattern Clustering & Misconception Hypothesis Engine
- Explainability Reasoning Center
"""
import pandas as pd
from typing import Dict, List, Any, Optional
from collections import Counter
import json
from .database import get_db

# Configurable thresholds
MASTERY_THRESHOLDS = {
    "HIGH": 60.0,     # mastery < 60% -> HIGH priority gap
    "MEDIUM": 75.0,   # 60-74.99% -> MEDIUM priority gap
    "LOW": 100.0,     # >= 75% -> LOW priority
}

MIN_RESPONSES_FOR_PATTERN = 3

# Concept Dependency Graph (prerequisites and downstream effects)
CONCEPT_DEPENDENCIES = {
    "Factorization": {
        "prerequisites": ["Linear Equations", "Algebraic Expressions"],
        "downstream": ["Quadratic Equations"],
        "reasoning": "Quadratic Equation solving heavily relies on identifying factor pairs."
    },
    "Quadratic Equations": {
        "prerequisites": ["Factorization", "Linear Equations"],
        "downstream": ["Functions", "Calculus"],
        "reasoning": "Understanding quadratic roots requires solid mastery of factoring and linear isolation."
    },
    "Linear Equations": {
        "prerequisites": ["Arithmetic"],
        "downstream": ["Factorization", "Inequalities", "Functions"],
        "reasoning": "Linear equation isolation is fundamental to all algebraic manipulations."
    },
    "Inequalities": {
        "prerequisites": ["Linear Equations"],
        "downstream": ["Functions"],
        "reasoning": "Inequality sign flips depend on solid inverse operation rules."
    },
    "Functions": {
        "prerequisites": ["Linear Equations", "Quadratic Equations"],
        "downstream": [],
        "reasoning": "Function evaluation and domain concepts build directly upon algebraic equations."
    }
}


def analyze_responses(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Comprehensive analysis pipeline returning Class-level Intelligence,
    Weighted Concept Mastery, Misconception Hypotheses, and Dependency Analysis.
    """
    results = {
        "total_students": 0,
        "total_questions": 0,
        "total_responses": 0,
        "average_mastery": 0.0,
        "assessment_completion": 0.0,
        "concepts": [],
        "learning_gaps": [],
        "error_patterns": [],
        "misconception_hypotheses": [],
        "class_clusters": {"Struggling": 0, "Developing": 0, "Mastery": 0, "Improving": 0},
        "dependency_warnings": [],
    }

    if df.empty:
        return results

    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]

    # Standardize correctness
    if "result" in df.columns and "is_correct" not in df.columns:
        df["is_correct"] = df["result"].apply(
            lambda x: 1 if str(x).strip().lower() in ["1", "true", "correct", "yes"] else 0
        )
    elif "is_correct" not in df.columns:
        if "student_answer" in df.columns and "correct_answer" in df.columns:
            df["is_correct"] = (
                df["student_answer"].astype(str).str.strip().str.lower()
                == df["correct_answer"].astype(str).str.strip().str.lower()
            ).astype(int)

    results["total_students"] = df["student_id"].nunique()
    results["total_questions"] = df["question_id"].nunique() if "question_id" in df.columns else 0
    results["total_responses"] = len(df)

    if results["total_questions"] > 0 and results["total_students"] > 0:
        expected_total = results["total_students"] * results["total_questions"]
        results["assessment_completion"] = round(
            min((results["total_responses"] / expected_total) * 100, 100), 1
        )

    concept_col = "concept" if "concept" in df.columns else "topic"

    # 1. Calculate Concept Mastery with Confidence Estimation
    if concept_col in df.columns:
        concept_stats = df.groupby(concept_col).agg(
            total=("is_correct", "count"),
            correct=("is_correct", "sum"),
            students=("student_id", "nunique"),
        ).reset_index()

        concept_list = []
        for _, row in concept_stats.iterrows():
            concept_name = row[concept_col]
            total_n = int(row["total"])
            correct_n = int(row["correct"])
            mastery = round((correct_n / total_n) * 100, 1) if total_n > 0 else 0.0

            # Confidence score estimation based on evidence sample size
            confidence = _calculate_confidence(total_n, row["students"])

            priority = _get_priority(mastery)
            concept_list.append({
                "concept": concept_name,
                "mastery": mastery,
                "confidence": confidence,
                "total_responses": total_n,
                "correct_responses": correct_n,
                "students": int(row["students"]),
                "priority": priority,
            })

        concept_list.sort(key=lambda x: x["mastery"])
        results["concepts"] = concept_list

        if concept_list:
            results["average_mastery"] = round(
                sum(c["mastery"] for c in concept_list) / len(concept_list), 1
            )

    # 2. Student Clustering (Class-level Archetypes)
    _cluster_students(df, results)

    # 3. Learning Gap Detection with Dependency Reasoning
    results["learning_gaps"] = _detect_learning_gaps_with_dependencies(df, results["concepts"], concept_col)

    # 4. Error Patterns
    results["error_patterns"] = _detect_error_patterns(df, concept_col)

    # 5. Misconception Hypothesis Engine
    results["misconception_hypotheses"] = _generate_misconception_hypotheses(df, results["error_patterns"], concept_col)

    return results


def _calculate_confidence(total_responses: int, total_students: int) -> float:
    """
    Estimate measurement confidence (0.0 to 1.0) based on sample size and observation density.
    """
    if total_students == 0:
        return 0.0
    avg_obs_per_student = total_responses / total_students
    confidence = min(0.95, round(0.40 + 0.15 * min(avg_obs_per_student, 4), 2))
    return confidence


def _get_priority(mastery: float) -> str:
    if mastery < MASTERY_THRESHOLDS["HIGH"]:
        return "HIGH"
    elif mastery < MASTERY_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    else:
        return "LOW"


def _cluster_students(df: pd.DataFrame, results: Dict):
    """Categorize students into learning archetypes."""
    student_masteries = df.groupby("student_id")["is_correct"].mean() * 100
    clusters = {"Struggling": 0, "Developing": 0, "Mastery": 0, "Improving": 0}

    for sid, mastery in student_masteries.items():
        if mastery < 55:
            clusters["Struggling"] += 1
        elif mastery < 75:
            clusters["Developing"] += 1
        else:
            clusters["Mastery"] += 1

    results["class_clusters"] = clusters


def _detect_learning_gaps_with_dependencies(
    df: pd.DataFrame, concepts: List[Dict], concept_col: str
) -> List[Dict]:
    """Detect learning gaps and evaluate downstream concept impacts."""
    gaps = []
    weak_concept_names = {c["concept"] for c in concepts if c["priority"] in ["HIGH", "MEDIUM"]}

    for concept_data in concepts:
        c_name = concept_data["concept"]
        if concept_data["priority"] in ["HIGH", "MEDIUM"]:
            concept_df = df[df[concept_col] == c_name]
            wrong_df = concept_df[concept_df["is_correct"] == 0]

            error_pattern = None
            common_wrong = None
            if len(wrong_df) >= MIN_RESPONSES_FOR_PATTERN and "student_answer" in wrong_df.columns:
                answer_counts = wrong_df["student_answer"].value_counts()
                if len(answer_counts) > 0:
                    most_common = answer_counts.index[0]
                    freq = answer_counts.iloc[0]
                    if freq >= MIN_RESPONSES_FOR_PATTERN:
                        common_wrong = str(most_common)
                        if "error_type" in wrong_df.columns:
                            error_types = wrong_df[wrong_df["student_answer"] == most_common]["error_type"].dropna()
                            if len(error_types) > 0:
                                error_pattern = error_types.mode().iloc[0] if len(error_types.mode()) > 0 else str(error_types.iloc[0])

            students_affected = concept_df[concept_df["is_correct"] == 0]["student_id"].nunique()

            # Dependency & Downstream reasoning
            dep_info = CONCEPT_DEPENDENCIES.get(c_name, {})
            prereqs = dep_info.get("prerequisites", [])
            downstream = dep_info.get("downstream", [])

            downstream_impact = []
            for ds in downstream:
                if ds in weak_concept_names:
                    downstream_impact.append(f"Performance in {ds} may be affected by weaker {c_name} mastery.")

            explainability_text = (
                f"Flagged as {concept_data['priority']} priority gap because class mastery ({concept_data['mastery']}%) "
                f"is below target threshold ({MASTERY_THRESHOLDS['HIGH']}%) based on {concept_data['total_responses']} observed attempts."
            )

            gaps.append({
                "concept": c_name,
                "mastery": concept_data["mastery"],
                "confidence": concept_data.get("confidence", 0.85),
                "priority": concept_data["priority"],
                "students_affected": students_affected,
                "total_students": concept_data["students"],
                "error_pattern": error_pattern,
                "common_wrong_answer": common_wrong,
                "recommended_action": f"Targeted {c_name.lower()} intervention",
                "prerequisites": prereqs,
                "downstream_impacts": downstream_impact,
                "explainability": explainability_text,
            })

    gaps.sort(key=lambda x: x["mastery"])
    return gaps


def _detect_error_patterns(df: pd.DataFrame, concept_col: str) -> List[Dict]:
    patterns = []
    wrong_df = df[df["is_correct"] == 0]

    if wrong_df.empty or "student_answer" not in wrong_df.columns:
        return patterns

    for concept in wrong_df[concept_col].unique():
        concept_wrong = wrong_df[wrong_df[concept_col] == concept]
        if len(concept_wrong) < MIN_RESPONSES_FOR_PATTERN:
            continue

        answer_counts = concept_wrong["student_answer"].value_counts()
        for answer, count in answer_counts.items():
            if count >= MIN_RESPONSES_FOR_PATTERN:
                students_with_error = concept_wrong[
                    concept_wrong["student_answer"] == answer
                ]["student_id"].nunique()

                correct_answer = None
                if "correct_answer" in concept_wrong.columns:
                    correct_answers = concept_wrong[
                        concept_wrong["student_answer"] == answer
                    ]["correct_answer"].dropna()
                    if len(correct_answers) > 0:
                        correct_answer = str(correct_answers.iloc[0])

                error_desc = None
                if "error_type" in concept_wrong.columns:
                    error_types = concept_wrong[
                        concept_wrong["student_answer"] == answer
                    ]["error_type"].dropna()
                    if len(error_types) > 0:
                        error_desc = str(error_types.mode().iloc[0]) if len(error_types.mode()) > 0 else str(error_types.iloc[0])

                patterns.append({
                    "concept": concept,
                    "wrong_answer": str(answer),
                    "correct_answer": correct_answer,
                    "frequency": int(count),
                    "students_affected": int(students_with_error),
                    "error_type": error_desc,
                    "description": f"Potential recurring error pattern in {concept}",
                })

    patterns.sort(key=lambda x: x["frequency"], reverse=True)
    return patterns


def _generate_misconception_hypotheses(df: pd.DataFrame, error_patterns: List[Dict], concept_col: str) -> List[Dict]:
    """
    Generates research-honest Misconception Hypotheses explicitly labeled as 'Potential Misconception'.
    """
    hypotheses = []
    for ep in error_patterns:
        if ep["frequency"] >= MIN_RESPONSES_FOR_PATTERN:
            error_type = ep.get("error_type") or "Conceptual misconception"
            conf = min(0.92, round(0.50 + 0.08 * ep["frequency"], 2))

            hypotheses.append({
                "hypothesis_id": f"HYP_{ep['concept'][:3].upper()}_{abs(hash(ep['wrong_answer'])) % 1000:03d}",
                "label": f"Potential misconception: {error_type}",
                "concept": ep["concept"],
                "evidence_summary": f"Observed {ep['frequency']} incorrect responses of '{ep['wrong_answer']}' across {ep['students_affected']} students.",
                "frequency": ep["frequency"],
                "students_affected": ep["students_affected"],
                "confidence": conf,
                "common_wrong_answer": ep["wrong_answer"],
                "expected_correct": ep["correct_answer"],
                "recommended_remediation": f"Provide focused review addressing {error_type.lower()}.",
            })

    hypotheses.sort(key=lambda x: x["confidence"], reverse=True)
    return hypotheses


def get_student_mastery(df: pd.DataFrame, student_id: str, concept_col: str = "concept") -> Dict:
    """Get detailed Student Knowledge Profile including confidence and archetypes."""
    student_df = df[df["student_id"] == student_id]

    if student_df.empty:
        return {"student_id": student_id, "overall_mastery": 0, "concepts": []}

    overall_correct = student_df["is_correct"].sum()
    overall_total = len(student_df)
    overall_mastery = round((overall_correct / overall_total) * 100, 1) if overall_total > 0 else 0

    # Determine Student Archetype
    if overall_mastery >= 80:
        archetype = "Mastery"
    elif overall_mastery >= 60:
        archetype = "Developing"
    else:
        archetype = "Struggling"

    concepts = []
    if concept_col in student_df.columns:
        for concept in student_df[concept_col].unique():
            c_df = student_df[student_df[concept_col] == concept]
            c_correct = c_df["is_correct"].sum()
            c_total = len(c_df)
            c_mastery = round((c_correct / c_total) * 100, 1) if c_total > 0 else 0
            c_conf = min(0.95, round(0.50 + 0.12 * c_total, 2))

            concepts.append({
                "concept": concept,
                "mastery": c_mastery,
                "confidence": c_conf,
                "correct": int(c_correct),
                "total": int(c_total),
                "priority": _get_priority(c_mastery),
            })

    concepts.sort(key=lambda x: x["mastery"])

    # Recent wrong answers with misconception hypothesis alignment
    wrong_answers = []
    wrong_df = student_df[student_df["is_correct"] == 0].tail(10)
    for _, row in wrong_df.iterrows():
        entry = {
            "concept": row.get(concept_col, ""),
            "student_answer": str(row.get("student_answer", "")),
            "correct_answer": str(row.get("correct_answer", "")),
            "error_type": row.get("error_type", None),
        }
        if "question" in row.index:
            entry["question"] = str(row["question"])
        if "question_id" in row.index:
            entry["question_id"] = str(row["question_id"])
        wrong_answers.append(entry)

    # Student-specific misconception hypotheses
    student_misconceptions = []
    for wa in wrong_answers:
        if wa.get("error_type"):
            student_misconceptions.append({
                "concept": wa["concept"],
                "label": f"Potential misconception: {wa['error_type']}",
                "evidence": f"Selected '{wa['student_answer']}' instead of '{wa['correct_answer']}'",
                "confidence": 0.81,
            })

    return {
        "student_id": student_id,
        "overall_mastery": overall_mastery,
        "archetype": archetype,
        "total_responses": int(overall_total),
        "correct_responses": int(overall_correct),
        "concepts": concepts,
        "weakest_concepts": [c for c in concepts if c["priority"] in ["HIGH", "MEDIUM"]][:3],
        "recent_wrong_answers": wrong_answers,
        "misconceptions": student_misconceptions[:3],
    }


def save_analysis_to_db(analysis: Dict, is_demo: bool = False):
    """Save analysis results to SQLite database."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO dataset_meta (name, is_demo, total_students, total_questions, total_responses) VALUES (?, ?, ?, ?, ?)",
        (
            "Demo Dataset" if is_demo else "Uploaded Assessment",
            1 if is_demo else 0,
            analysis["total_students"],
            analysis["total_questions"],
            analysis["total_responses"],
        ),
    )

    for concept_data in analysis["concepts"]:
        cursor.execute(
            """INSERT OR REPLACE INTO concepts
            (concept_id, concept_name, subject, mastery, total_responses, correct_responses, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                concept_data["concept"].lower().replace(" ", "_"),
                concept_data["concept"],
                "Mathematics",
                concept_data["mastery"],
                concept_data["total_responses"],
                concept_data["correct_responses"],
                concept_data["priority"],
            ),
        )

    for gap in analysis["learning_gaps"]:
        cursor.execute(
            """INSERT INTO learning_gaps
            (concept, mastery, priority, students_affected, total_students, error_pattern, common_wrong_answer, recommended_action)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                gap["concept"],
                gap["mastery"],
                gap["priority"],
                gap["students_affected"],
                gap["total_students"],
                gap.get("error_pattern"),
                gap.get("common_wrong_answer"),
                gap.get("recommended_action"),
            ),
        )

    conn.commit()
    conn.close()
