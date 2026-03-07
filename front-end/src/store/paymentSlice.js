import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const createPaymentOrder = createAsyncThunk(
  "payment/createOrder",
  async ({ teacherId, amount }, { rejectWithValue }) => {
    try {
      const res = await api.post("/payment/create-order", { teacherId, amount });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to create payment order");
    }
  }
);

export const verifyPayment = createAsyncThunk(
  "payment/verify",
  async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, teacherId, payment_method }, { rejectWithValue }) => {
    try {
      const res = await api.post("/payment/verify", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        teacherId,
        payment_method,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Payment verification failed");
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  "payment/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/payments/my");
      return res.data.payments;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch payment history");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    order: null,
    loading: false,
    error: null,
    paymentHistory: [],
  },
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
        state.order = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
