import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../shared/apiClient";
import { API_PATHS } from "../../shared/apiPath";

const getError = (error) =>
  error?.response?.data?.error || error?.response?.data?.message || error.message || "Request failed";

export const fetchDocuments = createAsyncThunk("documents/fetchDocuments", async (_, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.DOCUMENTS.LIST);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchDocument = createAsyncThunk("documents/fetchDocument", async (id, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.DOCUMENTS.DETAIL(id));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const uploadDocument = createAsyncThunk("documents/uploadDocument", async ({ file, title }, thunkApi) => {
  try {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", title);

    const { data } = await apiClient.post(API_PATHS.DOCUMENTS.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const deleteDocument = createAsyncThunk("documents/deleteDocument", async (id, thunkApi) => {
  try {
    const { data } = await apiClient.delete(API_PATHS.DOCUMENTS.DETAIL(id));
    return { ...data, id };
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchFlashcards = createAsyncThunk("documents/fetchFlashcards", async (documentId, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.FLASHCARDS.BY_DOCUMENT(documentId));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchQuizzes = createAsyncThunk("documents/fetchQuizzes", async (documentId, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.BY_DOCUMENT(documentId));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchQuizById = createAsyncThunk("documents/fetchQuizById", async (id, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.QUIZ_BY_ID(id));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const submitQuizAnswers = createAsyncThunk(
  "documents/submitQuizAnswers",
  async ({ id, answers }, thunkApi) => {
    try {
      const { data } = await apiClient.post(API_PATHS.QUIZZES.SUBMIT(id), { answers });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

export const fetchQuizResults = createAsyncThunk("documents/fetchQuizResults", async (id, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.RESULTS(id));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchChatHistory = createAsyncThunk("documents/fetchChatHistory", async (documentId, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.AI.CHAT_HISTORY(documentId));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const sendChatMessage = createAsyncThunk(
  "documents/sendChatMessage",
  async ({ documentId, question }, thunkApi) => {
    try {
      const { data } = await apiClient.post(API_PATHS.AI.CHAT, { documentId, question });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

export const generateSummary = createAsyncThunk("documents/generateSummary", async ({ documentId, focus }, thunkApi) => {
  try {
    const { data } = await apiClient.post(API_PATHS.AI.GENERATE_SUMMARY, { documentId, focus });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const explainConcept = createAsyncThunk(
  "documents/explainConcept",
  async ({ documentId, concept, audience = "beginner", detailLevel = "balanced" }, thunkApi) => {
    try {
      const { data } = await apiClient.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
        documentId,
        concept,
        audience,
        detailLevel,
      });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

export const generateFlashcards = createAsyncThunk(
  "documents/generateFlashcards",
  async ({ documentId, count = 10 }, thunkApi) => {
    try {
      const { data } = await apiClient.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId, count });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

export const generateQuiz = createAsyncThunk(
  "documents/generateQuiz",
  async ({ documentId, numQuestions = 5, title }, thunkApi) => {
    try {
      const { data } = await apiClient.post(API_PATHS.AI.GENERATE_QUIZ, { documentId, numQuestions, title });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

const documentsSlice = createSlice({
  name: "documents",
  initialState: {
    items: [],
    currentDocument: null,
    flashcards: [],
    quizzes: [],
    activeQuiz: null,
    quizResult: null,
    chatMessages: [],
    summary: null,
    conceptExplanation: null,
    loading: false,
    detailLoading: false,
    uploading: false,
    actionLoading: null,
    loaded: false,
    error: null,
  },
  reducers: {
    clearDocumentState: (state) => {
      state.currentDocument = null;
      state.flashcards = [];
      state.quizzes = [];
      state.activeQuiz = null;
      state.quizResult = null;
      state.chatMessages = [];
      state.summary = null;
      state.conceptExplanation = null;
      state.error = null;
      state.detailLoading = false;
      state.actionLoading = null;
    },
    clearDocumentsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.items = action.payload.data ?? [];
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload;
      })
      .addCase(fetchDocument.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentDocument = action.payload.data;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(uploadDocument.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploading = false;
        state.items = [action.payload.data, ...state.items];
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload.id);
        if (state.currentDocument?._id === action.payload.id) {
          state.currentDocument = null;
          state.flashcards = [];
          state.quizzes = [];
          state.summary = null;
          state.conceptExplanation = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchFlashcards.fulfilled, (state, action) => {
        state.flashcards = action.payload.data ?? [];
      })
      .addCase(fetchFlashcards.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.quizzes = action.payload.data ?? [];
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.actionLoading = "quiz-detail";
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.activeQuiz = action.payload.data ?? null;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      })
      .addCase(submitQuizAnswers.pending, (state) => {
        state.actionLoading = "quiz-submit";
        state.error = null;
      })
      .addCase(submitQuizAnswers.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.activeQuiz = action.payload.data ?? state.activeQuiz;
      })
      .addCase(submitQuizAnswers.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      })
      .addCase(fetchQuizResults.pending, (state) => {
        state.actionLoading = "quiz-results";
        state.error = null;
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.quizResult = action.payload.data ?? null;
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.chatMessages = action.payload.data ?? [];
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.actionLoading = "chat";
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.actionLoading = null;
        const userMessage = action.payload?.data?.userMessage;
        const assistantMessage = action.payload?.data?.assistantMessage;
        if (userMessage) state.chatMessages.push(userMessage);
        if (assistantMessage) state.chatMessages.push(assistantMessage);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      })
      .addCase(generateSummary.pending, (state) => {
        state.actionLoading = "summary";
        state.error = null;
      })
      .addCase(generateSummary.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.summary = action.payload.data;
      })
      .addCase(generateSummary.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      })
      .addCase(explainConcept.pending, (state) => {
        state.actionLoading = "explain-concept";
        state.error = null;
      })
      .addCase(explainConcept.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.conceptExplanation = action.payload.data;
      })
      .addCase(explainConcept.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      })
      .addCase(generateFlashcards.pending, (state) => {
        state.actionLoading = "flashcards";
        state.error = null;
      })
      .addCase(generateFlashcards.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.flashcards = [action.payload.data, ...state.flashcards.filter((item) => item._id !== action.payload.data._id)];
      })
      .addCase(generateFlashcards.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      })
      .addCase(generateQuiz.pending, (state) => {
        state.actionLoading = "quiz";
        state.error = null;
      })
      .addCase(generateQuiz.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.quizzes = [action.payload.data, ...state.quizzes.filter((item) => item._id !== action.payload.data._id)];
      })
      .addCase(generateQuiz.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      });
  },
});

export const { clearDocumentState, clearDocumentsError } = documentsSlice.actions;
export default documentsSlice.reducer;