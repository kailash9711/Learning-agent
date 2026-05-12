import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDocumentState,
  fetchDocument,
} from "../slices/documentsSlice";
import {
  clearAiState,
  fetchChatHistory,
  generateSummary,
  explainConcept,
  sendChatMessage,
  generateMindMap,
} from "../slices/aiSlice";
import {
  clearFlashcardsState,
  fetchFlashcards,
  fetchFlashcardHistory,
  generateFlashcards,
  trackFlashcardActivity,
} from "../slices/flashcardsSlice";
import {
  clearQuizzesState,
  fetchQuizzes,
  fetchQuizById,
  fetchQuizHistory,
  fetchQuizResults,
  generateQuiz,
  submitQuizAnswers,
  trackQuizActivity,
} from "../slices/quizzesSlice";

const normalizeDocumentId = (value) => {
  const raw = typeof value === "object" && value !== null
    ? value._id ?? value.id ?? value.documentId
    : value;

  return raw ? String(raw) : "";
};

export function useDocument(id) {
  const dispatch = useDispatch();
  const documentId = normalizeDocumentId(id);
  const {
    currentDocument: document,
    detailLoading,
    error,
  } = useSelector((state) => state.documents);
  const { items: flashcards, activityHistory: flashcardHistory, actionLoading: flashcardsLoading, error: flashcardsError } = useSelector((state) => state.flashcards);
  const { items: quizzes, activeQuiz, quizResult, activityHistory: quizHistory, actionLoading: quizLoading, error: quizzesError } = useSelector((state) => state.quizzes);
  const { chatMessages, summary, conceptExplanation, mindmap, actionLoading: aiLoading, error: aiError } = useSelector((state) => state.ai);

  useEffect(() => {
    if (!documentId) return;
    dispatch(fetchDocument(documentId));
    dispatch(fetchFlashcards(documentId));
    dispatch(fetchFlashcardHistory(documentId));
    dispatch(fetchQuizzes(documentId));
    dispatch(fetchQuizHistory(documentId));
    dispatch(fetchChatHistory(documentId));
    return () => {
      dispatch(clearDocumentState());
      dispatch(clearAiState());
      dispatch(clearFlashcardsState());
      dispatch(clearQuizzesState());
    };
  }, [dispatch, documentId]);

  const actionLoading = aiLoading || flashcardsLoading || quizLoading;
  const combinedError = error || aiError || flashcardsError || quizzesError;

  return {
    document,
    flashcards,
    flashcardHistory,
    quizzes,
    activeQuiz,
    quizResult,
    quizHistory,
    chatMessages,
    summary,
    conceptExplanation,
    mindmap,
    loading: detailLoading,
    actionLoading,
    error: combinedError,
    refetch: () => {
      dispatch(fetchDocument(documentId));
      dispatch(fetchFlashcards(documentId));
      dispatch(fetchFlashcardHistory(documentId));
      dispatch(fetchQuizzes(documentId));
      dispatch(fetchQuizHistory(documentId));
      dispatch(fetchChatHistory(documentId));
    },
    sendChatMessage: (question) => dispatch(sendChatMessage({ documentId, question })),
    fetchQuizById: (quizId) => dispatch(fetchQuizById(quizId)),
    submitQuizAnswers: (quizId, answers) => dispatch(submitQuizAnswers({ id: quizId, answers })),
    fetchQuizResults: (quizId) => dispatch(fetchQuizResults(quizId)),
    generateSummary: (focus) => dispatch(generateSummary({ documentId, focus })),
    explainConcept: (payload) => dispatch(explainConcept({ documentId, ...payload })),
    generateFlashcards: (count = 10, title) => dispatch(generateFlashcards({ documentId, count, title })),
    trackFlashcardActivity: (payload) => dispatch(trackFlashcardActivity(payload)),
    generateQuiz: (numQuestions = 5, title) => dispatch(generateQuiz({ documentId, numQuestions, title })),
    trackQuizActivity: (payload) => dispatch(trackQuizActivity(payload)),
    generateMindMap: () => dispatch(generateMindMap({ documentId })),
  };
}
