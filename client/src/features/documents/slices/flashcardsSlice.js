import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../shared/apiClient";
import { API_PATHS } from "../../../shared/apiPath";
import { getError } from "../utils/getError";

export const fetchFlashcards = createAsyncThunk("flashcards/fetchFlashcards", async (documentId, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.FLASHCARDS.BY_DOCUMENT(documentId));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchAllFlashcardSets = createAsyncThunk("flashcards/fetchAllFlashcardSets", async (_, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.FLASHCARDS.LIST_SETS);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchFlashcardHistory = createAsyncThunk("flashcards/fetchFlashcardHistory", async (documentId, thunkApi) => {
  try {
    const { data } = await apiClient.get(API_PATHS.FLASHCARDS.HISTORY, {
      params: documentId ? { documentId } : {},
    });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const trackFlashcardActivity = createAsyncThunk("flashcards/trackFlashcardActivity", async (payload, thunkApi) => {
  try {
    const { data } = await apiClient.post(API_PATHS.FLASHCARDS.ACTIVITY, payload);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const generateFlashcards = createAsyncThunk(
  "flashcards/generateFlashcards",
  async ({ documentId, count = 10, title }, thunkApi) => {
    try {
      const { data } = await apiClient.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId, count, title });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

const flashcardsSlice = createSlice({
  name: "flashcards",
  initialState: {
    items: [],
    allItems: [],
    activityHistory: [],
    actionLoading: null,
    error: null,
  },
  reducers: {
    clearFlashcardsState: (state) => {
      state.items = [];
      state.allItems = [];
      state.activityHistory = [];
      state.actionLoading = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlashcards.fulfilled, (state, action) => {
        state.items = action.payload.data ?? [];
      })
      .addCase(fetchFlashcards.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAllFlashcardSets.fulfilled, (state, action) => {
        state.allItems = action.payload.data ?? [];
      })
      .addCase(fetchAllFlashcardSets.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchFlashcardHistory.fulfilled, (state, action) => {
        state.activityHistory = action.payload.data ?? [];
      })
      .addCase(fetchFlashcardHistory.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(trackFlashcardActivity.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.activityHistory = [action.payload.data, ...state.activityHistory];
        }
      })
      .addCase(trackFlashcardActivity.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(generateFlashcards.pending, (state) => {
        state.actionLoading = "flashcards";
        state.error = null;
      })
      .addCase(generateFlashcards.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.items = [action.payload.data, ...state.items.filter((item) => item._id !== action.payload.data._id)];
      })
      .addCase(generateFlashcards.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      });
  },
});

export const { clearFlashcardsState } = flashcardsSlice.actions;
export default flashcardsSlice.reducer;
