export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_PATHS = {
	AUTH: {
		LOGIN: "/api/auth/login",
		REGISTER: "/api/auth/register",
		USER: "/api/auth/user",
		LOGOUT: "/api/auth/logout",
	},
	DOCUMENTS: {
		UPLOAD: "/api/documents/upload",
		LIST: "/api/documents",
		DETAIL: (id) => `/api/documents/${id}`,
		TEST_AUTH: "/api/documents/test-auth",
	},
	FLASHCARDS: {
		LIST_SETS: "/api/flashcards",
		BY_DOCUMENT: (documentId) => `/api/flashcards/${documentId}`,
		HISTORY: "/api/flashcards/history",
		ACTIVITY: "/api/flashcards/activity",
		REVIEW: (cardId) => `/api/flashcards/${cardId}/review`,
		STAR: (cardId) => `/api/flashcards/${cardId}/star`,
		DELETE_SET: (id) => `/api/flashcards/${id}`,
	},
	QUIZZES: {
		LIST_SETS: "/api/quiz",
		BY_DOCUMENT: (documentId) => `/api/quiz/${documentId}`,
		HISTORY: "/api/quiz/history",
		ACTIVITY: "/api/quiz/activity",
		QUIZ_BY_ID: (id) => `/api/quiz/quiz/${id}`,
		SUBMIT: (id) => `/api/quiz/${id}/submit`,
		RESULTS: (id) => `/api/quiz/${id}/results`,
		DELETE: (id) => `/api/quiz/${id}`,
	},
	AI: {
		GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
		GENERATE_QUIZ: "/api/ai/generate-quiz",
		QUIZ: "/api/ai/generate-quiz",
		GENERATE_SUMMARY: "/api/ai/generate-summary",
		CHAT: "/api/ai/chat",
		EXPLAIN_CONCEPT: "/api/ai/explain-concept",
		GENERATE_MINDMAP: "/api/ai/generate-mindmap",
		CHAT_HISTORY: (documentId) => `/api/ai/chat-history/${documentId}`,
	},
	USER: {
		STATS: "/api/user/stats",
	},
};
