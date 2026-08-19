# LEARNEX — Architecture Documentation
**SBW Hackathon 2026 Prototype Technical Specification**

---

## 1. Executive Summary

LEARNEX is an **Evidence-Driven Closed-Loop Learning Intelligence Prototype**. Rather than acting as a generic conversational chatbot, LEARNEX processes assessment item responses, deterministically calculates concept mastery heuristics and scalar confidence scores, identifies potential recurring error patterns, retrieves structured educational knowledge, and measures post-test percentage-point changes.

```
Assessment Response Data
       ↓
Deterministic Analysis Engine (Python / Pandas)
       ↓
Student Knowledge Model & Potential Misconception Hypotheses
       ↓
Concept Dependency Graph & Downstream Impact
       ↓
Structured Local Knowledge Retrieval & Intervention Generation
       ↓
Guided Adaptive Practice & Post-Test
       ↓
Observed Percentage-Point Gain (+36 pp in Demo Scenario)
```

---

## 2. Technical Classification & Research Honesty

- **Mastery Estimation**: Prototype heuristic based on percentage of correct item responses (`correct / total * 100`).
- **Confidence Estimation**: Scalar confidence score ($0.0 - 0.95$) based on item observation density.
- **Misconception Detection**: Rule-based heuristic explicitly outputting `Potential Misconception` / `Misconception Hypothesis`.
- **Knowledge Retrieval**: Structured local JSON retrieval (`data/knowledge/mathematics/algebra/*.json`).
- **Knowledge-Grounded Generation**: Intervention explanations, worked examples, and practice sets generated from local retrieved knowledge base schemas.
- **Student Archetypes**: Rule-based grouping (*Struggling* $< 55\%$, *Developing* $55-74\%$, *Mastery* $\ge 75\%$).
- **Demonstration Dataset**: 100 synthetic student profiles (`S001` - `S100`), 20 test items (`Q01` - `Q20`), 5 math concepts (*Linear Equations*, *Factorization*, *Quadratic Equations*, *Functions*, *Inequalities*). Explicitly labeled as `DEMO DATA / Synthetic Demonstration Data`.
- **Target Demo Scenario**: Student `S001` initial Factorization mastery $42\%$, post-test score $78\%$, observed change $+36$ percentage points (`post_score - pre_score`).
- **Disclosure**: The results shown in this prototype are simulated estimates derived from synthetic assessment response data and are not presented as real-world research findings.

---

## 3. System Division: Deterministic vs. AI-Assisted Components

### A. Deterministic Logic (Source of Truth)
- Assessment CSV parsing & data normalization (`backend/app/analysis.py`)
- Concept mastery score estimation & prioritization thresholding
- Scalar confidence score estimation ($0.0 - 0.95$)
- Error pattern grouping ($N \ge 3$ occurrences)
- Potential misconception hypothesis generation
- Concept dependency graph tracing (*Linear Equations $\rightarrow$ Factorization $\rightarrow$ Quadratic Equations*)
- Student archetype classification (*Struggling*, *Developing*, *Mastery*)
- Pre/post score comparison & percentage-point learning gain calculation

### B. Knowledge Retrieval & Intervention Layer
- Local structured knowledge retrieval (`data/knowledge/`)
- Knowledge-grounded intervention generation (with pre-cached fallback intervention objects for offline stability)
- Teacher review, editing, and approval workflow

---

## 4. API Endpoint Reference

| Method | Endpoint | Description | Implementation Status |
| text | text | text | text |
| `GET` | `/api/health` | System health check | Tested & Functional |
| `POST` | `/api/demo/load` | Loads synthetic demo dataset & interventions | Tested & Functional |
| `GET` | `/api/dashboard` | Returns class overview, clusters, and hypotheses | Tested & Functional |
| `POST` | `/api/assessment/upload` | Validates & parses uploaded assessment CSV | Tested & Functional |
| `GET` | `/api/students` | Lists enrolled student summaries and archetypes | Tested & Functional |
| `GET` | `/api/students/{id}` | Detailed student knowledge profile | Tested & Functional |
| `GET` | `/api/learning-gaps` | Lists detected gaps sorted by priority | Tested & Functional |
| `GET` | `/api/learning-gaps/{concept}` | Detail view with explainability & downstream impacts | Tested & Functional |
| `POST` | `/api/interventions/generate` | Generates/retrieves RAG grounded intervention | Tested & Functional |
| `POST` | `/api/interventions/{id}/approve` | Teacher approval workflow | Tested & Functional |
| `POST` | `/api/practice/submit` | Records interactive practice item attempts | Tested & Functional |
| `GET` | `/api/post-test/{concept}` | Fetches concept post-test evaluation items | Tested & Functional |
| `POST` | `/api/post-test/submit` | Submits post-test & calculates learning gain | Tested & Functional |
| `GET` | `/api/reports/{student_id}` | Complete pre/post learning gain report | Tested & Functional |

---

## 5. Local Execution Commands

### Backend Server (FastAPI)
```powershell
cd d:\SBW-Miracle\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Frontend Server (Vite / React)
```powershell
cd d:\SBW-Miracle\frontend
npm run dev
```

Open application at: `http://localhost:5173`
