import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../shared/apiClient";
import { API_PATHS } from "../../../shared/apiPath";
import { getError } from "../utils/getError";

export const fetchQuizzes = createAsyncThunk("quizzes/fetchQuizzes", async (documentId, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.BY_DOCUMENT(documentId));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchAllQuizSets = createAsyncThunk("quizzes/fetchAllQuizSets", async (_, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.LIST_SETS);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchQuizHistory = createAsyncThunk("quizzes/fetchQuizHistory", async (documentId, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.HISTORY, {
      params: documentId ? { documentId } : {},
    });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const trackQuizActivity = createAsyncThunk("quizzes/trackQuizActivity", async (payload, thunkApi) => {
  try {
    const { data } = await apiClient.post(API_PATHS.QUIZZES.ACTIVITY, payload);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchQuizById = createAsyncThunk("quizzes/fetchQuizById", async (id, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.QUIZ_BY_ID(id));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const submitQuizAnswers = createAsyncThunk("quizzes/submitQuizAnswers", async ({ id, answers }, thunkApi) => {
  try {
    const { data } = await apiClient.post(API_PATHS.QUIZZES.SUBMIT(id), { answers });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchQuizResults = createAsyncThunk("quizzes/fetchQuizResults", async (id, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.QUIZZES.RESULTS(id));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const generateQuiz = createAsyncThunk(
  "quizzes/generateQuiz",
  async ({ documentId, numQuestions = 5, title }, thunkApi) => {
    try {
      const { data } = await apiClient.post(API_PATHS.AI.GENERATE_QUIZ, { documentId, numQuestions, title });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState: {
    items: [],
    allItems: [],
    activeQuiz: null,
    quizResult: null,
    activityHistory: [],
    actionLoading: null,
    error: null,
  },
  reducers: {
    clearQuizzesState: (state) => {
      state.items = [];
      state.allItems = [];
      state.activeQuiz = null;
      state.quizResult = null;
      state.activityHistory = [];
      state.actionLoading = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.items = action.payload.data ?? [];
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAllQuizSets.fulfilled, (state, action) => {
        state.allItems = action.payload.data ?? [];
      })
      .addCase(fetchAllQuizSets.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchQuizHistory.fulfilled, (state, action) => {
        state.activityHistory = action.payload.data ?? [];
      })
      .addCase(fetchQuizHistory.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(trackQuizActivity.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.activityHistory = [action.payload.data, ...state.activityHistory];
        }
      })
      .addCase(trackQuizActivity.rejected, (state, action) => {
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
      .addCase(generateQuiz.pending, (state) => {
        state.actionLoading = "quiz";
        state.error = null;
      })
      .addCase(generateQuiz.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.items = [action.payload.data, ...state.items.filter((item) => item._id !== action.payload.data._id)];
      })
      .addCase(generateQuiz.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      });
  },
});

export const { clearQuizzesState } = quizzesSlice.actions;
export default quizzesSlice.reducer;
