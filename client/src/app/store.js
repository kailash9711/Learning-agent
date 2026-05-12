import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import documentsReducer from "../features/documents/slices/documentsSlice";
import aiReducer from "../features/documents/slices/aiSlice";
import flashcardsReducer from "../features/documents/slices/flashcardsSlice";
import quizzesReducer from "../features/documents/slices/quizzesSlice";
import uiReducer from "../shared/slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentsReducer,
    ai: aiReducer,
    flashcards: flashcardsReducer,
    quizzes: quizzesReducer,
    ui: uiReducer,
  },
});