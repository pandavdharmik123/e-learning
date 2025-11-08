import { Outlet } from "react-router-dom";
import Header from "@components/Header";
import Sidebar from "@components/Sidebar";

export default function DashboardLayout() {
  const headerHeight = 81;
  const sidebarWidth = 200;

  return (
    <div className="flex">
      <Header />

      <Sidebar />

      <main
        style={{
          marginLeft: sidebarWidth,
          marginTop: headerHeight,
          minHeight: `calc(100vh - ${headerHeight}px)`,
          background: "#f9f9ff",
          overflowY: "auto",
          width: `calc(100% - ${sidebarWidth}px)`,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
