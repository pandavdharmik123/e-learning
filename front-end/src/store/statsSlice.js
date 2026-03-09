import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const fetchStats = createAsyncThunk(
  "stats/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/stats");
      return res.data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch statistics");
    }
  }
);

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    stats: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default statsSlice.reducer;
