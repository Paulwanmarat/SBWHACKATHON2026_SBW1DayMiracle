"""
LEARNEX Demo Data Generator
Creates synthetic, deterministic assessment data for 100 students across 5 math concepts.
All data is explicitly labeled as DEMO/SYNTHETIC — never presented as real research.
"""
import random
import pandas as pd
import json
import os
from typing import List, Dict

# Fix seed for deterministic reproducibility
SEED = 42
random.seed(SEED)

CONCEPTS = [
    {
        "name": "Linear Equations",
        "topic": "Algebra",
        "target_mastery": 0.78,
        "questions": [
            {"id": "Q01", "text": "Solve for x: 2x + 4 = 10", "correct": "x = 3",
             "wrong_answers": ["x = 5", "x = 7", "x = 2"], "error_type": "Arithmetic error"},
            {"id": "Q02", "text": "Solve for x: 3x - 6 = 9", "correct": "x = 5",
             "wrong_answers": ["x = 3", "x = 1", "x = 15"], "error_type": "Sign error"},
            {"id": "Q03", "text": "Solve for x: x/2 + 3 = 7", "correct": "x = 8",
             "wrong_answers": ["x = 4", "x = 2", "x = 14"], "error_type": "Order of operations"},
            {"id": "Q04", "text": "Solve for x: 5x = 25", "correct": "x = 5",
             "wrong_answers": ["x = 20", "x = 30", "x = 125"], "error_type": "Division error"},
        ],
    },
    {
        "name": "Factorization",
        "topic": "Algebra",
        "target_mastery": 0.43,
        "questions": [
            {"id": "Q05", "text": "Factor: x² + 5x + 6", "correct": "(x+2)(x+3)",
             "wrong_answers": ["(x+1)(x+6)", "(x+2)(x+2)", "(x+3)(x+3)"], "error_type": "Incorrect factor-pair selection"},
            {"id": "Q06", "text": "Factor: x² + 7x + 12", "correct": "(x+3)(x+4)",
             "wrong_answers": ["(x+2)(x+6)", "(x+1)(x+12)", "(x+4)(x+4)"], "error_type": "Incorrect factor-pair selection"},
            {"id": "Q07", "text": "Factor: x² - 9", "correct": "(x+3)(x-3)",
             "wrong_answers": ["(x-3)(x-3)", "(x+9)(x-1)", "(x-9)(x+1)"], "error_type": "Difference of squares confusion"},
            {"id": "Q08", "text": "Factor: 2x² + 6x", "correct": "2x(x+3)",
             "wrong_answers": ["x(2x+6)", "2(x²+3x)", "2x(x+6)"], "error_type": "Incomplete factoring"},
        ],
    },
    {
        "name": "Quadratic Equations",
        "topic": "Algebra",
        "target_mastery": 0.61,
        "questions": [
            {"id": "Q09", "text": "Solve: x² - 5x + 6 = 0", "correct": "x = 2, x = 3",
             "wrong_answers": ["x = -2, x = -3", "x = 1, x = 6", "x = 2, x = -3"], "error_type": "Sign error in roots"},
            {"id": "Q10", "text": "What is the discriminant of x² + 4x + 4 = 0?", "correct": "0",
             "wrong_answers": ["16", "8", "-16"], "error_type": "Discriminant formula error"},
            {"id": "Q11", "text": "Solve: x² = 16", "correct": "x = 4, x = -4",
             "wrong_answers": ["x = 4", "x = 8", "x = 256"], "error_type": "Missing negative root"},
            {"id": "Q12", "text": "Solve using quadratic formula: x² - 3x - 10 = 0", "correct": "x = 5, x = -2",
             "wrong_answers": ["x = 5, x = 2", "x = -5, x = 2", "x = 10, x = -1"], "error_type": "Formula application error"},
        ],
    },
    {
        "name": "Functions",
        "topic": "Functions",
        "target_mastery": 0.72,
        "questions": [
            {"id": "Q13", "text": "If f(x) = 2x + 1, find f(3)", "correct": "7",
             "wrong_answers": ["6", "5", "9"], "error_type": "Substitution error"},
            {"id": "Q14", "text": "What is the domain of f(x) = 1/x?", "correct": "All real numbers except 0",
             "wrong_answers": ["All real numbers", "x > 0", "x ≥ 0"], "error_type": "Domain restriction oversight"},
            {"id": "Q15", "text": "If f(x) = x² and g(x) = x+1, find f(g(2))", "correct": "9",
             "wrong_answers": ["5", "6", "4"], "error_type": "Composition order error"},
            {"id": "Q16", "text": "Find the y-intercept of f(x) = 3x - 6", "correct": "-6",
             "wrong_answers": ["6", "3", "2"], "error_type": "Intercept identification error"},
        ],
    },
    {
        "name": "Inequalities",
        "topic": "Algebra",
        "target_mastery": 0.67,
        "questions": [
            {"id": "Q17", "text": "Solve: 2x + 3 > 7", "correct": "x > 2",
             "wrong_answers": ["x > 5", "x < 2", "x > 3.5"], "error_type": "Arithmetic error"},
            {"id": "Q18", "text": "Solve: -3x < 9", "correct": "x > -3",
             "wrong_answers": ["x < -3", "x < 3", "x > 3"], "error_type": "Sign flip with negative division"},
            {"id": "Q19", "text": "Solve: |x| ≤ 5", "correct": "-5 ≤ x ≤ 5",
             "wrong_answers": ["x ≤ 5", "x ≥ -5", "x = 5"], "error_type": "Absolute value misunderstanding"},
            {"id": "Q20", "text": "Graph the solution: x ≥ -2", "correct": "Closed circle at -2, shade right",
             "wrong_answers": ["Open circle at -2, shade right", "Closed circle at -2, shade left", "Open circle at 2, shade right"],
             "error_type": "Inequality symbol confusion"},
        ],
    },
]


def _student_answers_question(
    student_strength: float, concept_mastery: float, question: Dict
) -> Dict:
    """Determine if a student answers correctly based on their strength and concept difficulty."""
    # Combine student ability with concept difficulty
    probability = student_strength * concept_mastery
    # Add some noise
    probability += random.uniform(-0.15, 0.15)
    probability = max(0.05, min(0.95, probability))

    is_correct = random.random() < probability

    if is_correct:
        answer = question["correct"]
    else:
        # Pick a wrong answer, weighted toward the first (most common error)
        weights = [0.5, 0.3, 0.2]
        answer = random.choices(question["wrong_answers"], weights=weights, k=1)[0]

    return {
        "student_answer": answer,
        "is_correct": is_correct,
        "error_type": question["error_type"] if not is_correct else None,
    }


def generate_demo_data(num_students: int = 100) -> pd.DataFrame:
    """
    Generate deterministic demo assessment data.
    Returns a DataFrame with all required columns.
    """
    random.seed(SEED)

    rows = []
    student_ids = [f"S{str(i+1).zfill(3)}" for i in range(num_students)]

    # Assign each student a base strength (0.3 to 0.95)
    student_strengths = {}
    for sid in student_ids:
        if sid == "S001":
            student_strengths[sid] = 0.42
        else:
            student_strengths[sid] = random.uniform(0.3, 0.95)

    for student_id in student_ids:
        strength = student_strengths[student_id]

        # Simulate ~92% assessment completion
        if random.random() < 0.08:
            # This student skips some questions
            skip_count = random.randint(1, 4)
        else:
            skip_count = 0

        for concept_data in CONCEPTS:
            questions = concept_data["questions"]
            # Possibly skip some questions
            if skip_count > 0:
                questions_to_answer = random.sample(
                    questions, max(1, len(questions) - skip_count)
                )
                skip_count = 0
            else:
                questions_to_answer = questions

            for q in questions_to_answer:
                if student_id == "S001" and q["id"] == "Q05":
                    result = {
                        "student_answer": "(x+1)(x+6)",
                        "is_correct": False,
                        "error_type": "Incorrect factor-pair selection",
                    }
                elif student_id == "S001" and q["id"] == "Q06":
                    result = {
                        "student_answer": "(x+1)(x+12)",
                        "is_correct": False,
                        "error_type": "Incorrect factor-pair selection",
                    }
                else:
                    result = _student_answers_question(
                        strength, concept_data["target_mastery"], q
                    )
                rows.append({
                    "student_id": student_id,
                    "question_id": q["id"],
                    "question": q["text"],
                    "student_answer": result["student_answer"],
                    "correct_answer": q["correct"],
                    "subject": "Mathematics",
                    "topic": concept_data["topic"],
                    "subtopic": concept_data["name"],
                    "concept": concept_data["name"],
                    "result": "correct" if result["is_correct"] else "incorrect",
                    "is_correct": 1 if result["is_correct"] else 0,
                    "error_type": result["error_type"],
                    "misconception": result["error_type"],
                })

    df = pd.DataFrame(rows)
    return df


def generate_demo_csv(output_path: str = None) -> str:
    """Generate demo data and save to CSV."""
    df = generate_demo_data()

    if output_path is None:
        output_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data", "demo", "demo_assessment.csv"
        )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    return output_path


def get_demo_dataframe() -> pd.DataFrame:
    """Get the demo data as a DataFrame (generates if needed)."""
    return generate_demo_data()


# Pre-defined fallback interventions
FALLBACK_INTERVENTIONS = {
    "Factorization": {
        "concept": "Factorization",
        "learning_objective": "Students will identify factor pairs of quadratic expressions and apply correct factoring techniques.",
        "explanation": """## Factoring Quadratic Expressions

A quadratic expression in the form **x² + bx + c** can be factored by finding two numbers that:
- **Multiply** to give **c** (the constant term)
- **Add** to give **b** (the coefficient of x)

### Key Steps:
1. Write down the expression: x² + bx + c
2. Find factor pairs of c
3. Check which pair adds up to b
4. Write the factored form: (x + p)(x + q) where p × q = c and p + q = b

### Important Notes:
- Always check your answer by expanding (multiplying out) the factors
- Pay attention to signs: negative constants require one positive and one negative factor
- For expressions like x² - a², use the difference of squares: (x+a)(x-a)""",
        "worked_example": """### Example: Factor x² + 5x + 6

**Step 1:** Identify a = 1, b = 5, c = 6

**Step 2:** Find factor pairs of 6:
- 1 × 6 = 6 → 1 + 6 = 7 ✗
- 2 × 3 = 6 → 2 + 3 = 5 ✓

**Step 3:** The pair (2, 3) multiplies to 6 and adds to 5.

**Step 4:** Write the answer: **(x + 2)(x + 3)**

**Verification:** (x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6 ✓

### Common Mistake:
Students often choose (x + 1)(x + 6) because 1 and 6 are also factors of 6.
But 1 + 6 = 7 ≠ 5, so this is incorrect.""",
        "practice_questions": json.dumps([
            {
                "question": "Factor: x² + 7x + 12",
                "options": ["(x+3)(x+4)", "(x+2)(x+6)", "(x+1)(x+12)", "(x+4)(x+4)"],
                "correct": 0,
                "explanation": "We need two numbers that multiply to 12 and add to 7. That's 3 and 4. So (x+3)(x+4)."
            },
            {
                "question": "Factor: x² + 8x + 15",
                "options": ["(x+1)(x+15)", "(x+3)(x+5)", "(x+5)(x+5)", "(x+4)(x+4)"],
                "correct": 1,
                "explanation": "We need two numbers that multiply to 15 and add to 8. That's 3 and 5. So (x+3)(x+5)."
            },
            {
                "question": "Factor: x² - 4",
                "options": ["(x-2)(x-2)", "(x+2)(x-2)", "(x+4)(x-1)", "(x-4)(x+1)"],
                "correct": 1,
                "explanation": "This is a difference of squares: x² - 4 = x² - 2² = (x+2)(x-2)."
            },
            {
                "question": "Factor: x² + 6x + 9",
                "options": ["(x+3)(x+3)", "(x+1)(x+9)", "(x+2)(x+4)", "(x+6)(x+3)"],
                "correct": 0,
                "explanation": "We need two numbers that multiply to 9 and add to 6. That's 3 and 3. So (x+3)(x+3) = (x+3)²."
            },
            {
                "question": "Factor: 3x² + 9x",
                "options": ["x(3x+9)", "3(x²+3x)", "3x(x+3)", "9x(x+1)"],
                "correct": 2,
                "explanation": "First find the GCF: 3x. Then 3x² + 9x = 3x(x + 3)."
            }
        ]),
        "difficulty": "medium",
        "expected_skill": "Factor quadratic expressions by identifying correct factor pairs",
        "is_fallback": True,
    },
    "Linear Equations": {
        "concept": "Linear Equations",
        "learning_objective": "Students will solve linear equations in one variable using inverse operations.",
        "explanation": """## Solving Linear Equations

A linear equation has the form **ax + b = c** where x is the unknown.

### Key Principle: Whatever you do to one side, do to the other.

### Steps:
1. Simplify both sides if needed
2. Move variable terms to one side
3. Move constant terms to the other side
4. Divide by the coefficient of x

### Remember:
- Adding/subtracting moves terms across the equals sign
- The sign changes when you move a term to the other side
- Always verify by substituting your answer back""",
        "worked_example": """### Example: Solve 2x + 4 = 10

**Step 1:** Subtract 4 from both sides: 2x = 10 - 4 = 6
**Step 2:** Divide both sides by 2: x = 6/2 = 3
**Step 3:** Verify: 2(3) + 4 = 6 + 4 = 10 ✓

**Answer: x = 3**""",
        "practice_questions": json.dumps([
            {"question": "Solve: 3x + 6 = 21", "options": ["x = 5", "x = 7", "x = 9", "x = 3"], "correct": 0, "explanation": "3x = 21 - 6 = 15, so x = 15/3 = 5."},
            {"question": "Solve: 4x - 8 = 12", "options": ["x = 1", "x = 3", "x = 5", "x = 4"], "correct": 2, "explanation": "4x = 12 + 8 = 20, so x = 20/4 = 5."},
            {"question": "Solve: x/3 + 2 = 5", "options": ["x = 9", "x = 1", "x = 15", "x = 3"], "correct": 0, "explanation": "x/3 = 5 - 2 = 3, so x = 3 × 3 = 9."},
            {"question": "Solve: 7x = 49", "options": ["x = 42", "x = 56", "x = 7", "x = 343"], "correct": 2, "explanation": "x = 49/7 = 7."},
        ]),
        "difficulty": "easy",
        "expected_skill": "Apply inverse operations to isolate variables in linear equations",
        "is_fallback": True,
    },
    "Quadratic Equations": {
        "concept": "Quadratic Equations",
        "learning_objective": "Students will solve quadratic equations using factoring and the quadratic formula.",
        "explanation": """## Solving Quadratic Equations

A quadratic equation has the form **ax² + bx + c = 0**.

### Methods:
1. **Factoring**: If the expression factors nicely
2. **Quadratic Formula**: x = (-b ± √(b²-4ac)) / 2a
3. **Completing the Square**: Useful in some cases

### The Discriminant (b² - 4ac):
- If > 0: Two distinct real roots
- If = 0: One repeated root
- If < 0: No real roots""",
        "worked_example": """### Example: Solve x² - 5x + 6 = 0

**Method: Factoring**
**Step 1:** Find two numbers that multiply to 6 and add to -5: That's -2 and -3.
**Step 2:** Factor: (x - 2)(x - 3) = 0
**Step 3:** Set each factor to zero: x - 2 = 0 → x = 2, x - 3 = 0 → x = 3

**Answer: x = 2, x = 3**

**Verification:** (2)² - 5(2) + 6 = 4 - 10 + 6 = 0 ✓""",
        "practice_questions": json.dumps([
            {"question": "Solve: x² - 7x + 10 = 0", "options": ["x = 2, x = 5", "x = -2, x = -5", "x = 1, x = 10", "x = -2, x = 5"], "correct": 0, "explanation": "Factor: (x-2)(x-5) = 0, so x = 2 or x = 5."},
            {"question": "What is the discriminant of x² + 2x + 1 = 0?", "options": ["4", "0", "-4", "2"], "correct": 1, "explanation": "D = b² - 4ac = 4 - 4(1)(1) = 0."},
            {"question": "Solve: x² = 25", "options": ["x = 5", "x = 5, x = -5", "x = 625", "x = -5"], "correct": 1, "explanation": "x² = 25 means x = ±√25 = ±5."},
        ]),
        "difficulty": "medium",
        "expected_skill": "Solve quadratic equations and understand the nature of their roots",
        "is_fallback": True,
    },
    "Functions": {
        "concept": "Functions",
        "learning_objective": "Students will evaluate functions, identify domains, and understand function composition.",
        "explanation": """## Understanding Functions

A function f(x) assigns exactly one output to each input x.

### Key Concepts:
- **Evaluation**: Substitute the input value for x
- **Domain**: All possible input values
- **Range**: All possible output values
- **Composition**: f(g(x)) means apply g first, then f""",
        "worked_example": """### Example: If f(x) = 2x + 1, find f(3)

**Step 1:** Replace x with 3: f(3) = 2(3) + 1
**Step 2:** Calculate: f(3) = 6 + 1 = 7

**Answer: f(3) = 7**""",
        "practice_questions": json.dumps([
            {"question": "If f(x) = 3x - 2, find f(4)", "options": ["10", "14", "12", "6"], "correct": 0, "explanation": "f(4) = 3(4) - 2 = 12 - 2 = 10."},
            {"question": "What is the domain of f(x) = √x?", "options": ["All real numbers", "x ≥ 0", "x > 0", "x ≠ 0"], "correct": 1, "explanation": "√x requires x ≥ 0."},
            {"question": "If f(x) = x² and g(x) = x+2, find f(g(1))", "options": ["3", "4", "9", "5"], "correct": 2, "explanation": "g(1) = 1+2 = 3, then f(3) = 3² = 9."},
        ]),
        "difficulty": "medium",
        "expected_skill": "Evaluate functions and understand domain, range, and composition",
        "is_fallback": True,
    },
    "Inequalities": {
        "concept": "Inequalities",
        "learning_objective": "Students will solve linear inequalities and understand sign rules when multiplying/dividing by negatives.",
        "explanation": """## Solving Inequalities

Inequalities are like equations, but with <, >, ≤, or ≥.

### Critical Rule:
**When you multiply or divide by a negative number, FLIP the inequality sign!**

### Steps:
1. Treat it like an equation
2. Remember to flip the sign when multiplying/dividing by negatives
3. Express the solution as an interval or inequality""",
        "worked_example": """### Example: Solve -3x < 9

**Step 1:** Divide both sides by -3
**Step 2:** FLIP the inequality: x > -3 (because we divided by a negative)

**Answer: x > -3**""",
        "practice_questions": json.dumps([
            {"question": "Solve: 2x + 1 > 7", "options": ["x > 3", "x > 4", "x < 3", "x > 6"], "correct": 0, "explanation": "2x > 6, so x > 3."},
            {"question": "Solve: -5x ≥ 20", "options": ["x ≥ -4", "x ≤ -4", "x ≥ 4", "x ≤ 4"], "correct": 1, "explanation": "Divide by -5 and flip: x ≤ -4."},
            {"question": "Solve: |x| < 3", "options": ["x < 3", "-3 < x < 3", "x > -3", "x = 3"], "correct": 1, "explanation": "|x| < 3 means -3 < x < 3."},
        ]),
        "difficulty": "medium",
        "expected_skill": "Solve inequalities including those requiring sign changes",
        "is_fallback": True,
    },
}


# Post-test questions for each concept (different from practice to measure actual learning)
POST_TEST_QUESTIONS = {
    "Factorization": [
        {"question": "Factor: x² + 9x + 20", "options": ["(x+4)(x+5)", "(x+2)(x+10)", "(x+10)(x+2)", "(x+5)(x+5)"], "correct": 0, "explanation": "4 × 5 = 20 and 4 + 5 = 9."},
        {"question": "Factor: x² - 16", "options": ["(x-4)(x-4)", "(x+4)(x-4)", "(x-8)(x+2)", "(x+16)(x-1)"], "correct": 1, "explanation": "Difference of squares: (x+4)(x-4)."},
        {"question": "Factor: x² + 2x - 15", "options": ["(x+5)(x-3)", "(x-5)(x+3)", "(x+15)(x-1)", "(x+5)(x+3)"], "correct": 0, "explanation": "5 × (-3) = -15 and 5 + (-3) = 2."},
        {"question": "Factor: 4x² + 8x", "options": ["x(4x+8)", "2x(2x+4)", "4x(x+2)", "4(x²+2x)"], "correct": 2, "explanation": "GCF is 4x: 4x² + 8x = 4x(x+2)."},
        {"question": "Factor: x² - 6x + 9", "options": ["(x-3)(x-3)", "(x+3)(x-3)", "(x-9)(x+1)", "(x-1)(x-9)"], "correct": 0, "explanation": "(-3) × (-3) = 9 and (-3) + (-3) = -6. Perfect square: (x-3)²."},
    ],
    "Linear Equations": [
        {"question": "Solve: 5x - 3 = 22", "options": ["x = 5", "x = 3.8", "x = 25", "x = 19"], "correct": 0, "explanation": "5x = 25, x = 5."},
        {"question": "Solve: 2(x + 4) = 16", "options": ["x = 4", "x = 6", "x = 8", "x = 12"], "correct": 0, "explanation": "2x + 8 = 16, 2x = 8, x = 4."},
        {"question": "Solve: x/4 - 1 = 3", "options": ["x = 8", "x = 12", "x = 16", "x = 2"], "correct": 2, "explanation": "x/4 = 4, x = 16."},
        {"question": "Solve: 6x + 2 = 3x + 11", "options": ["x = 3", "x = 9", "x = 4.3", "x = 13"], "correct": 0, "explanation": "3x = 9, x = 3."},
    ],
    "Quadratic Equations": [
        {"question": "Solve: x² - 8x + 15 = 0", "options": ["x = 3, x = 5", "x = -3, x = -5", "x = 1, x = 15", "x = 3, x = -5"], "correct": 0, "explanation": "(x-3)(x-5) = 0."},
        {"question": "How many real roots does x² + 1 = 0 have?", "options": ["2", "1", "0", "Infinite"], "correct": 2, "explanation": "D = 0 - 4 = -4 < 0, no real roots."},
        {"question": "Solve: x² - 9 = 0", "options": ["x = 3", "x = 3, x = -3", "x = 9", "x = 81"], "correct": 1, "explanation": "x² = 9, x = ±3."},
        {"question": "Solve: 2x² - 8x = 0", "options": ["x = 0, x = 4", "x = 4", "x = 0", "x = 2, x = 4"], "correct": 0, "explanation": "2x(x-4) = 0, x = 0 or x = 4."},
    ],
    "Functions": [
        {"question": "If f(x) = x² - 1, find f(5)", "options": ["24", "26", "4", "25"], "correct": 0, "explanation": "f(5) = 25 - 1 = 24."},
        {"question": "If f(x) = 2x + 3 and g(x) = x - 1, find f(g(4))", "options": ["9", "11", "7", "10"], "correct": 0, "explanation": "g(4) = 3, f(3) = 9."},
        {"question": "What is the range of f(x) = x²?", "options": ["All real numbers", "y ≥ 0", "y > 0", "y ≤ 0"], "correct": 1, "explanation": "x² is always ≥ 0."},
    ],
    "Inequalities": [
        {"question": "Solve: 3x - 5 > 10", "options": ["x > 5", "x > 15", "x < 5", "x > 3"], "correct": 0, "explanation": "3x > 15, x > 5."},
        {"question": "Solve: -2x + 4 ≤ 10", "options": ["x ≤ -3", "x ≥ -3", "x ≤ 3", "x ≥ 3"], "correct": 1, "explanation": "-2x ≤ 6, x ≥ -3 (flip!)."},
        {"question": "Solve: |x - 1| ≤ 4", "options": ["-3 ≤ x ≤ 5", "x ≤ 5", "-4 ≤ x ≤ 4", "x ≥ -3"], "correct": 0, "explanation": "-4 ≤ x - 1 ≤ 4, so -3 ≤ x ≤ 5."},
    ],
}


if __name__ == "__main__":
    path = generate_demo_csv()
    print(f"Demo data generated: {path}")
    df = get_demo_dataframe()
    print(f"Total rows: {len(df)}")
    print(f"Students: {df['student_id'].nunique()}")
    print(f"Questions: {df['question_id'].nunique()}")
    print("\nConcept breakdown:")
    for concept in df["concept"].unique():
        cdf = df[df["concept"] == concept]
        mastery = cdf["is_correct"].mean() * 100
        print(f"  {concept}: {mastery:.1f}% mastery")
