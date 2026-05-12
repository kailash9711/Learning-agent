import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDocumentsError,
  deleteDocument as deleteDocumentThunk,
  fetchDocuments,
  uploadDocument as uploadDocumentThunk,
} from "../slices/documentsSlice";

export function useDocuments() {
  const dispatch = useDispatch();
  const { items: documents, loading, uploading, error, loaded } = useSelector((state) => state.documents);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchDocuments());
    }
  }, [dispatch, loaded]);

  const uploadDocument = async (file, title) => {
    try {
      const result = await dispatch(uploadDocumentThunk({ file, title }));
      if (uploadDocumentThunk.fulfilled.match(result)) {
        return { success: true };
      }
      return { success: false, error: result.payload };
    } catch {
      return { success: false, error: "Upload failed. Please try again." };
    }
  };

  const deleteDocument = async (id) => {
    try {
      const result = await dispatch(deleteDocumentThunk(id));
      if (deleteDocumentThunk.fulfilled.match(result)) {
        return { success: true };
      }
      return { success: false, error: result.payload };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  return {
    documents,
    loading,
    uploading,
    error,
    uploadDocument,
    deleteDocument,
    refetch: () => dispatch(fetchDocuments()),
    clearError: () => dispatch(clearDocumentsError()),
  };
}
