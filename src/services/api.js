/**
 * Speakly API service layer.
 * Centralized HTTP client with JWT interceptors and error handling.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('speakly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('speakly_token');
      localStorage.removeItem('speakly_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (data) =>
    api.post('/auth/register', data),

  getMe: () =>
    api.get('/auth/me'),

  // TEMPORARY — Demo signup for MVP testing
  demoSignup: (data) =>
    api.post('/auth/demo-signup', data),

  getConfig: () =>
    api.get('/auth/config'),
};

// ==================== STUDENTS ====================

export const studentAPI = {
  getHome: () =>
    api.get('/students/home'),

  getLeaderboard: () =>
    api.get('/students/leaderboard'),

  submitAssignment: (assignmentId, score, feedback) =>
    api.post('/students/assignments/submit', { assignment_id: assignmentId, score, feedback }),
};

// ==================== TENSES ====================

export const tenseAPI = {
  getAll: () =>
    api.get('/tenses/'),

  getById: (id) =>
    api.get(`/tenses/${id}`),

  generateExercise: (id) =>
    api.post(`/tenses/${id}/generate-exercise`),

  submitProgress: (id, mastery_percent) =>
    api.post(`/tenses/${id}/submit`, { mastery_percent }),
};

// ==================== VOCABULARY ====================

export const vocabularyAPI = {
  getAll: (level, search) => {
    const params = {};
    if (level) params.level = level;
    if (search) params.search = search;
    return api.get('/vocabulary/', { params });
  },

  getWordOfDay: () =>
    api.get('/vocabulary/word-of-day'),

  getById: (id) =>
    api.get(`/vocabulary/${id}`),

  markLearned: (id) =>
    api.post(`/vocabulary/${id}/mark-learned`),
};

// ==================== QUIZ ====================

export const quizAPI = {
  generate: (topic, difficulty, num_questions) =>
    api.post('/quiz/generate', { topic, difficulty, num_questions }),

  submit: (score, total_questions) =>
    api.post('/quiz/submit', { score, total_questions }),
};

// ==================== VOICE ====================

export const voiceAPI = {
  transcribe: (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    return api.post('/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  respond: (data) =>
    api.post('/voice/respond', data),

  endSession: (data) =>
    api.post('/voice/end-session', data),
};

// ==================== PROGRESS ====================

export const progressAPI = {
  getOverview: () =>
    api.get('/progress/'),
};

// ==================== MODAL VERBS ====================

export const modalVerbsAPI = {
  getAll: () =>
    api.get('/modal-verbs/'),

  getProgress: () =>
    api.get('/modal-verbs/progress'),

  getById: (id) =>
    api.get(`/modal-verbs/${id}`),

  generateExercise: (id) =>
    api.post(`/modal-verbs/${id}/generate-exercise`),

  submitProgress: (id, correct_count, total) =>
    api.post(`/modal-verbs/${id}/submit`, { correct_count, total }),
};

// ==================== GRAMMAR LESSONS ====================

export const grammarLessonsAPI = {
  getAll: (category) =>
    api.get('/grammar-lessons/', { params: category ? { category } : {} }),

  getCategories: () =>
    api.get('/grammar-lessons/categories'),

  getById: (id) =>
    api.get(`/grammar-lessons/${id}`),

  getProgress: () =>
    api.get('/grammar-lessons/progress'),

  generateExercise: (id) =>
    api.post(`/grammar-lessons/${id}/generate-exercise`),

  generateContent: (id) =>
    api.post(`/grammar-lessons/${id}/generate-content`),

  submitProgress: (id, correct_count, total) =>
    api.post(`/grammar-lessons/${id}/submit`, { correct_count, total }),
};

// ==================== TEACHER ====================

export const teacherAPI = {
  getDashboard: () =>
    api.get('/teacher/dashboard'),

  getStudents: () =>
    api.get('/teacher/students'),

  createAssignment: (data) =>
    api.post('/teacher/assignments', data),

  generateAssignmentPreview: (data) =>
    api.post('/teacher/assignments/generate-preview', data),

  getAssignments: () =>
    api.get('/teacher/assignments'),

  getSubmissions: () =>
    api.get('/teacher/assignments/submissions'),

  getStudentProgress: (studentId) =>
    api.get(`/teacher/students/${studentId}/progress`),
};

// ==================== OWNER ====================

export const ownerAPI = {
  getDashboard: () =>
    api.get('/owner/dashboard'),

  getStudents: () =>
    api.get('/owner/students'),

  getRegisteredStudents: () =>
    api.get('/owner/students/registered'),

  addStudent: (email) =>
    api.post('/owner/students', typeof email === 'object' ? email : { email }),

  whitelistStudent: (email) =>
    api.post('/owner/students', typeof email === 'object' ? email : { email }),

  removeStudent: (email) =>
    api.delete(`/owner/students/${email}`),

  getTeachers: () =>
    api.get('/owner/teachers'),

  addTeacher: (email) =>
    api.post('/owner/teachers', typeof email === 'object' ? email : { email }),

  whitelistTeacher: (email) =>
    api.post('/owner/teachers', typeof email === 'object' ? email : { email }),

  getAssignments: () =>
    api.get('/owner/assignments'),
};

// ==================== ADMIN ====================

export const adminAPI = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getOrganizations: () =>
    api.get('/admin/organizations'),

  updateOrganization: (orgId, data) =>
    api.patch(`/admin/organizations/${orgId}`, data),

  deleteOrganization: (orgId) =>
    api.delete(`/admin/organizations/${orgId}`),

  getUsers: () =>
    api.get('/admin/users'),
};

export default api;
