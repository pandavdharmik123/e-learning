// src/routes.jsx
import { Navigate } from "react-router-dom";

import HomePage from "@pages/HomePage";
import SignIn from '@pages/Login/index.jsx';
// import LoginPage from "@pages/LoginPage";
//
// import AdminDashboard from "@pages/admin/AdminDashboard";
// import TeacherDashboard from "@pages/teacher/TeacherDashboard";
// import StudentDashboard from "@pages/student/StudentDashboard";
//
// import TeacherProfile from "@pages/teacher/Profile";
// import TeacherBooks from "@pages/teacher/Books";
// import TeacherMaterials from "@pages/teacher/Materials";
// import TeacherClasses from "@pages/teacher/Classes";
// import TeacherStudents from "@pages/teacher/Students";
//
// import StudentTeachers from "@pages/student/Teachers";
// import StudentBooks from "@pages/student/Books";
// import StudentMaterials from "@pages/student/Materials";
// import StudentClasses from "@pages/student/Classes";
// import StudentHired from "@pages/student/HiredTeachers";

export const publicRoutes = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <SignIn /> },
];

// export const adminRoutes = [
//   { path: "/admin/dashboard", element: <AdminDashboard /> },
//   // Add more admin pages as needed
// ];
//
// export const teacherRoutes = [
//   { path: "/teacher/dashboard", element: <TeacherDashboard /> },
//   { path: "/teacher/profile", element: <TeacherProfile /> },
//   { path: "/teacher/books", element: <TeacherBooks /> },
//   { path: "/teacher/materials", element: <TeacherMaterials /> },
//   { path: "/teacher/classes", element: <TeacherClasses /> },
//   { path: "/teacher/students", element: <TeacherStudents /> },
// ];
//
// export const studentRoutes = [
//   { path: "/student/dashboard", element: <StudentDashboard /> },
//   { path: "/student/teachers", element: <StudentTeachers /> },
//   { path: "/student/books", element: <StudentBooks /> },
//   { path: "/student/materials", element: <StudentMaterials /> },
//   { path: "/student/classes", element: <StudentClasses /> },
//   { path: "/student/hired", element: <StudentHired /> },
// ];
