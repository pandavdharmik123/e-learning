import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import './sidebar.scss';

const { Sider } = Layout;
const sidebarWidth = 200;
const headerHeight = 79;

export default function Sidebar() {

  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);


  const items = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/dashboard/profile", icon: <UserOutlined />, label: "Profile" },
    { key: "/dashboard/students", icon: <TeamOutlined />, label: "Students", role:['teacher'] },
    { key: "/dashboard/teachers", icon: <TeamOutlined />, label: "Teachers", role:['student'] },
    { key: "/dashboard/users", icon: <TeamOutlined />, label: "Users", role:['admin'] },
    // { key: "/dashboard/books", icon: <BookOutlined />, label: "Books" },
    // { key: "/dashboard/materials", icon: <FileTextOutlined />, label: "Materials" },
    { key: "/dashboard/classes", icon: <CalendarOutlined />, label: "Classes", role:['student', 'teacher'] },
    { key: "/dashboard/documents", icon: <FileTextOutlined />, label: "Documents", role:['student', 'teacher'] },
  ];

  return (
    <div
      style={{
        width: sidebarWidth,
        position: "fixed",
        top: headerHeight,
        left: 0,
        height: `calc(100vh - ${headerHeight}px)`,
        background: "#fff",
        borderRight: "1px solid #eee",
        zIndex: 40,
      }}
    >
      <Sider
        collapsedWidth="0"
        className="sidebar-container min-h-screen shadow-md"
        style={{ background: "#fff" }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items.filter((item) => !item.role  || item.role.includes(user.role))}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
    </div>
  );
}
