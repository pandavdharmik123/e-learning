import {
  BookOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

export const formatDate = (date) => {
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options).replace(" ", " ");
}

export const getRoleIcon = (role) => {
  switch (role) {
    case "teacher":
      return <BookOutlined />;
    case "student":
      return <TeamOutlined />;
    case "admin":
      return <SolutionOutlined />;
    default:
      return <UserOutlined />;
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case "teacher":
      return "#1890ff";
    case "student":
      return "#52c41a";
    case "admin":
      return "#722ed1";
    default:
      return "#666";
  }
};