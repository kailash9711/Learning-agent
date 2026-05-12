import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../shared/apiClient";
import { API_PATHS } from "../../../shared/apiPath";
import { getError } from "../utils/getError";

const normalizeDocumentId = (value) => {
  const raw = typeof value === "object" && value !== null
    ? value._id ?? value.id ?? value.documentId
    : value;

  return raw ? String(raw) : "";
};

export const fetchChatHistory = createAsyncThunk("ai/fetchChatHistory", async (documentId, thunkApi) => {
  try {
    const normalizedId = normalizeDocumentId(documentId);
    if (!normalizedId) {
      return thunkApi.rejectWithValue("Please provide a valid documentId");
    }
    const { data } = await apiClient.get(API_PATHS.AI.CHAT_HISTORY(normalizedId));
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const sendChatMessage = createAsyncThunk("ai/sendChatMessage", async ({ documentId, question }, thunkApi) => {
  try {
    const normalizedId = normalizeDocumentId(documentId);
    if (!normalizedId) {
      return thunkApi.rejectWithValue("Please provide a valid documentId");
    }
    const persona = thunkApi.getState().ai.aiPersona;
    const { data } = await apiClient.post(API_PATHS.AI.CHAT, { 
      documentId: normalizedId, 
      question,
      persona 
    });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const generateSummary = createAsyncThunk("ai/generateSummary", async ({ documentId, focus }, thunkApi) => {
  try {
    const normalizedId = normalizeDocumentId(documentId);
    if (!normalizedId) {
      return thunkApi.rejectWithValue("Please provide a valid documentId");
    }
    const persona = thunkApi.getState().ai.aiPersona;
    const { data } = await apiClient.post(API_PATHS.AI.GENERATE_SUMMARY, { 
      documentId: normalizedId, 
      focus,
      persona
    });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const explainConcept = createAsyncThunk(
  "ai/explainConcept",
  async ({ documentId, concept, audience = "beginner", detailLevel = "balanced" }, thunkApi) => {
    try {
      const normalizedId = normalizeDocumentId(documentId);
      if (!normalizedId) {
        return thunkApi.rejectWithValue("Please provide a valid documentId");
      }
      const { data } = await apiClient.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
        documentId: normalizedId,
        concept,
        audience,
        detailLevel,
        persona: thunkApi.getState().ai.aiPersona,
      });
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getError(error));
    }
  }
);

export const generateMindMap = createAsyncThunk("ai/generateMindMap", async ({ documentId }, thunkApi) => {
  try {
    const normalizedId = normalizeDocumentId(documentId);
    if (!normalizedId) {
      return thunkApi.rejectWithValue("Please provide a valid documentId");
    }
    const { data } = await apiClient.post(API_PATHS.AI.GENERATE_MINDMAP, { documentId: normalizedId });
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    chatMessages: [],
    summary: null,
    conceptExplanation: null,
    mindmap: null,
    aiPersona: "standard", // standard, socratic, specialist, peer
    actionLoading: null,
    error: null,
  },
  reducers: {
    clearAiState: (state) => {
      state.chatMessages = [];
      state.summary = null;
      state.conceptExplanation = null;
      state.actionLoading = null;
      state.error = null;
    },
    setAiPersona: (state, action) => {
      state.aiPersona = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(generateMindMap.pending, (state) => {
        state.actionLoading = "mindmap";
        state.error = null;
      })
      .addCase(generateMindMap.fulfilled, (state, action) => {
        state.actionLoading = null;
        state.mindmap = action.payload.data;
      })
      .addCase(generateMindMap.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload;
      });
  },
});

export const { clearAiState, setAiPersona } = aiSlice.actions;
export default aiSlice.reducer;
