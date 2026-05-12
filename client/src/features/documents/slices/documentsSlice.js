import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../shared/apiClient";
import { API_PATHS } from "../../../shared/apiPath";
import { getError } from "../utils/getError";

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

const documentsSlice = createSlice({
  name: "documents",
  initialState: {
    items: [],
    currentDocument: null,
    loading: false,
    detailLoading: false,
    uploading: false,
    loaded: false,
    error: null,
  },
  reducers: {
    clearDocumentState: (state) => {
      state.currentDocument = null;
      state.error = null;
      state.detailLoading = false;
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
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearDocumentState, clearDocumentsError } = documentsSlice.actions;
export default documentsSlice.reducer;
