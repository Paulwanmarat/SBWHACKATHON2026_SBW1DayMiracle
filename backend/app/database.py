"""
LEARNEX Database Module
SQLite database for assessment data, learning gaps, interventions, and results.
"""
import sqlite3
import os
import json
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "learnex.db")


def get_db() -> sqlite3.Connection:
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Initialize the database schema."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS questions (
            question_id TEXT PRIMARY KEY,
            question_text TEXT,
            correct_answer TEXT,
            subject TEXT,
            topic TEXT,
            subtopic TEXT,
            concept TEXT,
            difficulty TEXT DEFAULT 'medium'
        );

        CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            student_answer TEXT,
            correct_answer TEXT,
            is_correct INTEGER NOT NULL,
            subject TEXT,
            topic TEXT,
            concept TEXT,
            error_type TEXT,
            misconception TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id),
            FOREIGN KEY (question_id) REFERENCES questions(question_id)
        );

        CREATE TABLE IF NOT EXISTS concepts (
            concept_id TEXT PRIMARY KEY,
            concept_name TEXT NOT NULL,
            subject TEXT,
            topic TEXT,
            mastery REAL DEFAULT 0.0,
            total_responses INTEGER DEFAULT 0,
            correct_responses INTEGER DEFAULT 0,
            priority TEXT DEFAULT 'LOW',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS learning_gaps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            concept TEXT NOT NULL,
            mastery REAL NOT NULL,
            priority TEXT NOT NULL,
            students_affected INTEGER DEFAULT 0,
            total_students INTEGER DEFAULT 0,
            error_pattern TEXT,
            common_wrong_answer TEXT,
            recommended_action TEXT,
            status TEXT DEFAULT 'detected',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS interventions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            learning_gap_id INTEGER,
            concept TEXT NOT NULL,
            learning_objective TEXT,
            explanation TEXT,
            worked_example TEXT,
            practice_questions TEXT,
            difficulty TEXT DEFAULT 'medium',
            expected_skill TEXT,
            status TEXT DEFAULT 'draft',
            is_fallback INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP,
            FOREIGN KEY (learning_gap_id) REFERENCES learning_gaps(id)
        );

        CREATE TABLE IF NOT EXISTS practice_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            intervention_id INTEGER,
            concept TEXT NOT NULL,
            question_text TEXT,
            student_answer TEXT,
            correct_answer TEXT,
            is_correct INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id),
            FOREIGN KEY (intervention_id) REFERENCES interventions(id)
        );

        CREATE TABLE IF NOT EXISTS post_test_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            concept TEXT NOT NULL,
            pre_score REAL,
            post_score REAL,
            learning_gain REAL,
            questions_total INTEGER DEFAULT 0,
            questions_correct INTEGER DEFAULT 0,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        );

        CREATE TABLE IF NOT EXISTS dataset_meta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            is_demo INTEGER DEFAULT 0,
            total_students INTEGER DEFAULT 0,
            total_questions INTEGER DEFAULT 0,
            total_responses INTEGER DEFAULT 0,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    conn.close()


def clear_db():
    """Clear all data from the database (used before loading new dataset)."""
    conn = get_db()
    cursor = conn.cursor()
    tables = [
        "post_test_attempts", "practice_attempts", "interventions",
        "learning_gaps", "concepts", "responses", "questions",
        "students", "dataset_meta"
    ]
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
    conn.commit()
    conn.close()


# Initialize on import
init_db()
