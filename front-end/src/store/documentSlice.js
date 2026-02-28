import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const createDocument = createAsyncThunk(
  "documents/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.document;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchDocuments = createAsyncThunk(
  "documents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/documents");
      return res.data.documents;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateDocument = createAsyncThunk(
  "documents/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/documents/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.document;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update document");
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "documents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete document");
    }
  }
);

export const fetchDocumentReads = createAsyncThunk(
  "documents/fetchReads",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/documents/${id}/reads`);
      return { id, reads: res.data.reads };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch reads");
    }
  }
);

export const getDocumentSignedUrl = async (id) => {
  const res = await api.get(`/documents/${id}/url`);
  return res.data.url;
};

const documentSlice = createSlice({
  name: "documents",
  initialState: {
    documents: [],
    reads: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearReads: (state) => {
      state.reads = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.documents.findIndex(
          (d) => d.document_id === action.payload.document_id
        );
        if (idx !== -1) state.documents[idx] = action.payload;
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(
          (d) => d.document_id !== action.payload
        );
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchDocumentReads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentReads.fulfilled, (state, action) => {
        state.loading = false;
        state.reads = action.payload.reads;
      })
      .addCase(fetchDocumentReads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReads } = documentSlice.actions;
export default documentSlice.reducer;
