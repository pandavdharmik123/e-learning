import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";


export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/users");
      return res.data.users;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch users"
      );
    }
  }
);

export const updateUserVerification = createAsyncThunk(
  "admin/updateUserVerification",
  async ({ userId, is_verified }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/admin/users/${userId}/verify`, { is_verified });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to update verification");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data.user; // The soft-deleted user object
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete user"
      );
    }
  }
);

export const getAllPayments = createAsyncThunk(
  "admin/getAllPayments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/payments");
      return res.data.payments;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch payments"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    payments: [],
    loading: false,
    error: null,
  },
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserVerification.fulfilled, (state, action) => {
        state.loading = false;

        const idx = state.users.findIndex((u) => u.user_id === action.payload.user_id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })
      .addCase(updateUserVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // remove deleted user from list
        state.users = state.users.filter(
          (u) => u.user_id !== action.payload.user_id
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
