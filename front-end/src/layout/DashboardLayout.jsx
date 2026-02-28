import { Outlet } from "react-router-dom";
import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import './dashboardLayout.scss';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Header />
      <Sidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
