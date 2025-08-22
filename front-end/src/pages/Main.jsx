import { Routes, Route } from "react-router-dom";
import { useEffect, useMemo, useState } from 'react';
import {
  publicRoutes
} from "@/routes/index.jsx";
import Logo from '@components/Logo/index.jsx';
import NotFoundPage from '@pages/NotFoundPage';

const Main = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("user_role"); // e.g., 'admin', 'teacher', 'student'
    setRole(storedRole);
  }, []);

  const routesToRender = useMemo(() => {
    return publicRoutes; // Adjust this logic if you use role-based routing
  }, [role]);

  return (
    <Routes>
      {routesToRender.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Main;
