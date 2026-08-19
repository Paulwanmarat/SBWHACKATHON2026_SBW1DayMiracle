// LEARNEX Type Definitions

export interface Concept {
  concept: string;
  mastery: number;
  confidence?: number;
  total_responses: number;
  correct_responses: number;
  students: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface LearningGap {
  concept: string;
  mastery: number;
  confidence?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  students_affected: number;
  total_students: number;
  error_pattern: string | null;
  common_wrong_answer: string | null;
  recommended_action: string;
  prerequisites?: string[];
  downstream_impacts?: string[];
  explainability?: string;
}

export interface ErrorPattern {
  concept: string;
  wrong_answer: string;
  correct_answer: string | null;
  frequency: number;
  students_affected: number;
  error_type: string | null;
  description: string;
}

export interface MisconceptionHypothesis {
  hypothesis_id: string;
  label: string;
  concept: string;
  evidence_summary: string;
  frequency: number;
  students_affected: number;
  confidence: number;
  common_wrong_answer: string;
  expected_correct?: string;
  recommended_remediation: string;
}

export interface DashboardData {
  has_data: boolean;
  is_demo: boolean;
  total_students: number;
  total_questions: number;
  total_responses: number;
  average_mastery: number;
  assessment_completion: number;
  learning_gaps_count: number;
  concepts: Concept[];
  learning_gaps: LearningGap[];
  error_patterns: ErrorPattern[];
  class_clusters?: Record<string, number>;
  misconception_hypotheses?: MisconceptionHypothesis[];
  message?: string;
}

export interface StudentSummary {
  student_id: string;
  overall_mastery: number;
  total_responses: number;
  weakest_concept: string | null;
}

export interface StudentConcept {
  concept: string;
  mastery: number;
  confidence?: number;
  correct: number;
  total: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface WrongAnswer {
  concept: string;
  student_answer: string;
  correct_answer: string;
  question?: string;
  question_id?: string;
  error_type?: string;
}

export interface StudentDetail {
  student_id: string;
  overall_mastery: number;
  archetype?: string;
  total_responses: number;
  correct_responses: number;
  concepts: StudentConcept[];
  weakest_concepts: StudentConcept[];
  recent_wrong_answers: WrongAnswer[];
  misconceptions?: { concept: string; label: string; evidence: string; confidence: number }[];
  interventions: Intervention[];
  post_tests: PostTestResult[];
  practice_attempts: PracticeAttempt[];
}

export interface Intervention {
  id: number;
  learning_gap_id: number | null;
  concept: string;
  learning_objective: string;
  explanation: string;
  worked_example: string;
  practice_questions: PracticeQuestion[] | string;
  difficulty: string;
  expected_skill: string;
  status: string;
  is_fallback: number;
  created_at: string;
  approved_at: string | null;
  source?: string;
  note?: string;
  citations?: string[];
}

export interface PracticeQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface PracticeAttempt {
  id: number;
  student_id: string;
  intervention_id: number | null;
  concept: string;
  question_text: string;
  student_answer: string;
  correct_answer: string;
  is_correct: number;
  created_at: string;
}

export interface PostTestResult {
  id: number;
  student_id: string;
  concept: string;
  pre_score: number;
  post_score: number;
  learning_gain: number;
  questions_total: number;
  questions_correct: number;
  details: string;
  created_at: string;
}

export interface LearningGapDetail extends LearningGap {
  error_patterns: ErrorPattern[];
  affected_students: {
    student_id: string;
    overall_mastery: number;
    concept_mastery: number;
  }[];
}
