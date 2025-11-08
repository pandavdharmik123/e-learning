import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";


export const fetchHiredTeachers = createAsyncThunk(
  "student/fetchHiredTeachers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/student/me/teachers");
      return res.data.teachers;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch hired teachers");
    }
  }
);


export const hireTeacher = createAsyncThunk(
  "student/hireTeacher",
  async (teacherId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/teachers/${teacherId}/hire`);
      return res.data.teacher;
    } catch (err) {
      let errMessage = '';
      if(err?.response?.status === 409) {
        errMessage = err?.response?.data?.message;
      }
      return rejectWithValue(errMessage || err.response?.data?.error || "Failed to hire teacher");
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    hiredTeachers: [],
    loading: false,
    error: null,
    message: ""
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchHiredTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHiredTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.hiredTeachers = action.payload;
      })
      .addCase(fetchHiredTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      .addCase(hireTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hireTeacher.fulfilled, (state, action) => {
        state.loading = false;

        const teacher = action.payload;
        if (!state.hiredTeachers.some(t => t.teacher_id === teacher.teacher_id)) {
          state.hiredTeachers.push(teacher);
        }
      })
      .addCase(hireTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default studentSlice.reducer;
