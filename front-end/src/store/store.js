import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import teacherReducer from "./teacherSlice";
import studentReducer from "./studentSlice";
import classReducer from "./classSlice";
import adminReducer from "./adminSlice";
import documentReducer from "./documentSlice";
import paymentReducer from "./paymentSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    teachers: teacherReducer,
    students: studentReducer,
    classes: classReducer,
    admin: adminReducer,
    documents: documentReducer,
    payment: paymentReducer,
  },
});

export default store;
