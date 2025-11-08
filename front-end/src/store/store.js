import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import teacherReducer from "./teacherSlice";
import studentReducer from "./studentSlice";
import classReducer from "./classSlice";
import adminReducer from "./adminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    teachers: teacherReducer,
    students: studentReducer,
    classes: classReducer,
    admin: adminReducer,
  },
});

export default store;
