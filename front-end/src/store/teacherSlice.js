import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const fetchTeachers = createAsyncThunk(
  "teachers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/teacher/all");
      return res.data.teachers;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchTeacherStudents = createAsyncThunk(
  "teacher/fetchTeacherStudents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/teacher/me/students");
      return res.data.students;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchTeacherPayments = createAsyncThunk(
  "teacher/fetchPayments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/teacher/payments");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const teacherSlice = createSlice({
  name: "teachers",
  initialState: {
    teachers: [],
    students: [],
    payments: [],
    paymentSummary: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTeacherStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchTeacherStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTeacherPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
        state.paymentSummary = action.payload.summary;
      })
      .addCase(fetchTeacherPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default teacherSlice.reducer;
