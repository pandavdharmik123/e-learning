import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchSubjects = createAsyncThunk(
  'subjects/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/subjects');
      return res.data.subjects;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch subjects');
    }
  }
);

export const createSubject = createAsyncThunk(
  'subjects/create',
  async ({ name }, { rejectWithValue }) => {
    try {
      const res = await api.post('/admin/subjects', { name });
      return res.data.subject;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create subject');
    }
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/update',
  async ({ subject_id, name }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/admin/subjects/${subject_id}`, { name });
      return res.data.subject;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update subject');
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/delete',
  async (subject_id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/subjects/${subject_id}`);
      return subject_id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete subject');
    }
  }
);

const subjectSlice = createSlice({
  name: 'subjects',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        const idx = state.list.findIndex((s) => s.subject_id === action.payload.subject_id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.subject_id !== action.payload);
      });
  },
});

export const { clearError } = subjectSlice.actions;
export default subjectSlice.reducer;
