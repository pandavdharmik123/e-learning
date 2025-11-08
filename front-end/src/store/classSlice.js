import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const createClass = createAsyncThunk(
  "class/createClass",
  async (classData, { rejectWithValue }) => {
    try {
      const res = await api.post("/class/create", classData);
      return res.data.class;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateClass = createAsyncThunk(
  "class/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/class/${id}`, updates);
      return res.data.class;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update class");
    }
  }
);

export const fetchTeacherClasses = createAsyncThunk(
  "class/fetchTeacherClasses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/teacher/class");
      return res.data.classes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchStudentClasses = createAsyncThunk(
  "class/fetchStudentClasses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/student/class");
      return res.data.classes;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);
export const deleteClass = createAsyncThunk(
  "class/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/class/${id}`);
      return res.data.class; // we return the deleted class object
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete class");
    }
  }
);

const classSlice = createSlice({
  name: "class",
  initialState: {
    classes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.loading = false;
        state.classes.unshift(action.payload);
      })
      .addCase(createClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTeacherClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchTeacherClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchStudentClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchStudentClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.classes.findIndex(c => c.class_id === action.payload.class_id);
        if (idx !== -1) {
          state.classes[idx] = action.payload;
        }
      })
      .addCase(updateClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = state.classes.filter(
          (c) => c.class_id !== action.payload.class_id
        );
      })
      .addCase(deleteClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default classSlice.reducer;