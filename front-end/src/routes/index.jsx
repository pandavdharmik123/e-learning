import HomePage from "@pages/HomePage";
import SignIn from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import ProfilePage from '@pages/Profile';
import ExploreTeachers from '@pages/ExploreTeachers';
import HiredTeachers from '@pages/HiredTeachers';
import TeacherStudents from '@pages/TeacherStudents';
import ClassManagement from '@pages/Classes';
import AdminUsersPage from '@pages/Users';
import Documents from '@pages/Documents';
import AdminPayments from '@pages/AdminPayments';
import UserPayments from '@pages/UserPayments';
import TeacherPayments from '@pages/TeacherPayments';

export const publicRoutes = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <SignIn /> },
  { path: "/register", element: <Register /> },
];

export const privateRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/dashboard/profile", element: <ProfilePage /> },
  { path: "/dashboard/teachers", element: <HiredTeachers /> },
  { path: "/dashboard/students", element: <TeacherStudents /> },
  { path: "/dashboard/classes", element: <ClassManagement /> },
  { path: "/dashboard/documents", element: <Documents /> },
  { path: "/dashboard/users", element: <AdminUsersPage /> },
  { path: "/dashboard/payments", element: <UserPayments /> },
  { path: "/dashboard/teacher/payments", element: <TeacherPayments /> },
  { path: "/dashboard/admin/payments", element: <AdminPayments /> },
  // { path: "/explore/teachers", element: <ExploreTeachers /> },
];
