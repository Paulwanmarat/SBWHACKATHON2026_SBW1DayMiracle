// LEARNEX API Client

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://learnex-backend-679b.onrender.com/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health
  health: () => request<{ status: string }>('/health'),

  // Demo
  loadDemo: () => request<any>('/demo/load', { method: 'POST' }),

  // Dashboard
  getDashboard: () => request<any>('/dashboard'),

  // Assessment
  uploadAssessment: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/assessment/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Students
  getStudents: () => request<any>('/students'),
  getStudent: (id: string) => request<any>(`/students/${id}`),

  // Learning Gaps
  getLearningGaps: () => request<any>('/learning-gaps'),
  getLearningGapDetail: (concept: string) =>
    request<any>(`/learning-gaps/${encodeURIComponent(concept)}`),

  // Interventions
  getInterventions: () => request<any>('/interventions'),
  getIntervention: (id: number) => request<any>(`/interventions/${id}`),

  generateIntervention: (concept: string, learningGapId?: number) =>
    request<any>('/interventions/generate', {
      method: 'POST',
      body: JSON.stringify({
        concept,
        learning_gap_id: learningGapId,
      }),
    }),

  approveIntervention: (id: number) =>
    request<any>(`/interventions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'approved' }),
    }),

  // Practice
  submitPractice: (data: {
    student_id: string;
    concept: string;
    intervention_id?: number;
    question_text: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }) =>
    request<any>('/practice/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Post-Test
  getPostTestQuestions: (concept: string) =>
    request<any>(`/post-test/${encodeURIComponent(concept)}`),

  submitPostTest: (data: {
    student_id: string;
    concept: string;
    answers: {
      question_index: number;
      selected_answer: string;
      is_correct: boolean;
    }[];
  }) =>
    request<any>('/post-test/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reports
  getStudentReport: (id: string) =>
    request<any>(`/reports/${id}`),
};