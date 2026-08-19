# LEARNEX — Evidence-Driven Closed-Loop Learning Intelligence System
**SBW HACKATHON 2026 Prototype Submission**

> *"ChatGPT can answer a student's question, but LEARNEX starts from evidence of what the student does not understand. It identifies learning gaps from assessment data, provides targeted intervention, and measures whether the student actually improved."*

---

## 📌 Executive Overview

LEARNEX is an educational intelligence prototype designed to demonstrate a **closed-loop educational workflow**. Rather than functioning as a generic AI chatbot, LEARNEX processes assessment response data to deterministically calculate concept mastery heuristics, estimate scalar confidence scores, identify potential recurring error patterns, retrieve structured educational content, and evaluate pre/post test percentage-point changes.

---

## 🌟 Core System Capabilities

1. **Teacher Intelligence Dashboard**: Class overview, student archetype distribution (*Struggling*, *Developing*, *Mastery*), concept mastery heuristics, priority learning gaps.
2. **Deterministic Analytics Core**: Rule-based mastery score estimation, scalar confidence score computation ($0.0 - 0.95$), error pattern clustering ($N \ge 3$).
3. **Misconception Hypothesis Engine**: Research-honest rule-based misconception detection labeled explicitly as `Potential Misconception`.
4. **Explainability Center**: Explicit "WHY?" cards for flagged learning gaps, intervention assignments, and downstream concept dependencies (*Linear Equations $\rightarrow$ Factorization $\rightarrow$ Quadratic Equations*).
5. **Teacher-in-the-Loop Interventions**: Knowledge-grounded intervention generation via structured local knowledge base retrieval (`data/knowledge/`) providing explanations, worked examples, and practice sets requiring teacher approval.
6. **Guided Adaptive Practice**: Dynamic practice interface with level progression (Beginner, Intermediate, Advanced) and immediate corrective feedback.
7. **Closed-Loop Post-Test & Learning Gain**: Targeted post-test evaluation measuring percentage-point changes ($+36$ pp demonstrated for student S001 in a synthetic demonstration scenario).
8. **Synthetic Demonstration Dataset**: 100 students, 20 items, 5 math concepts. Explicitly labeled as `DEMO DATA / Synthetic Demonstration Data`.

---

## 📊 Synthetic Data & Research Disclosure

- **Data Source**: Synthetic demonstration dataset containing 100 student profiles (`S001` - `S100`), 20 test items, and 5 mathematics concepts (*Linear Equations*, *Factorization*, *Quadratic Equations*, *Functions*, *Inequalities*).
- **Target Student Scenario**: Student `S001` starts with an initial Factorization mastery of $42\%$ and a recurring factor-pair error pattern `(x+1)(x+6)` for $x^2+5x+6$. Following targeted intervention and practice, post-test evaluation records $78\%$ mastery ($+36$ percentage-point change within the prototype simulation).
- **Disclosure**: The results shown in this prototype are simulated estimates derived from synthetic assessment response data and are not presented as real-world research findings.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+

### 1. Start Backend API Server
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
Backend API: `http://localhost:8000` (Interactive API Docs: `http://localhost:8000/docs`)

### 2. Start Frontend Application
```powershell
cd frontend
npm run dev
```
Frontend UI: `http://localhost:5173`

---

## 🎬 2-Minute Live Demo Flow

1. Open `http://localhost:5173`.
2. Click **Load Demo Data** on the Dashboard.
3. Inspect **Class Overview**: Factorization flagged as Priority Gap ($43\%$ mastery, $37$ students affected).
4. Click **Inspect Gap & Evidence**: Review common wrong answer `(x+1)(x+6)` and downstream warning for Quadratic Equations.
5. Open **Student S001**: Review $42\%$ initial mastery, `Struggling` archetype, and identified misconception hypothesis.
6. Click **Generate Intervention** $\rightarrow$ Review structured local knowledge base citations $\rightarrow$ Click **Approve**.
7. Click **Launch Student Learning View**: Review explanation, worked example, complete adaptive practice set, and take Post-Test.
8. View **Learning Gains Report**: Observe measured $+36$ percentage points gain ($42\% \rightarrow 78\%$).

---

## 🛠 Project Structure

```text
d:\SBW-Miracle\
├── backend/
│   ├── app/
│   │   ├── analysis.py        # Deterministic analysis engine & misconception hypotheses
│   │   ├── database.py        # SQLite schema & foreign key management
│   │   ├── demo_data.py       # Synthetic dataset generator (100 students, 20 items)
│   │   └── main.py            # FastAPI REST endpoints
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── api/client.ts      # Typed API client
│   │   ├── components/        # Sidebar, TopBar
│   │   ├── pages/             # Dashboard, Assessment, Students, Gaps, Interventions, Practice, PostTest, Report
│   │   └── types/index.ts     # TypeScript interfaces
│   └── package.json
├── data/
│   ├── demo/                  # Demo assessment CSV
│   └── knowledge/             # Structured local knowledge base JSON files
├── ARCHITECTURE.md            # Technical specification & API documentation
└── README.md                  # Project overview & demo guide
```

---

## 📄 License & Event Information
Submitted for **SBW HACKATHON 2026** — Educational Technology Category.
