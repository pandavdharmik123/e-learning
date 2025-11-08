import { Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "@/routes";
import NotFoundPage from "@pages/NotFoundPage";
import PrivateRoute from "@/routes/PrivateRoute";
import DashboardLayout from "@/layout/DashboardLayout";

const Main = () => {
  return (
    <Routes>
      {publicRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}

      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          {privateRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Main;
