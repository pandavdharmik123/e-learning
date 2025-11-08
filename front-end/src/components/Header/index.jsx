import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from "@components/Logo/index.jsx";
import { logout } from '@store/authSlice.js';
import './header.scss'
import RoleTag from '@components/RoleTag/index.jsx';

export function Greeting({ user }) {
  const hours = new Date().getHours();

  let greeting = "Hello";
  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <div className="greeting text-gray-700 font-medium">
        {greeting}, {user?.first_name || ""} {user?.last_name || ""}
      </div>
      <div className={'flex align-center justify-between'}>
        <div className="date text-sm text-gray-500">{formattedDate}</div>
        <RoleTag role={user?.role} />

      </div>
    </div>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { token, user } = useSelector((state) => state.auth);

  const isDashboardRoute = useMemo(() => {
    return location.pathname.startsWith("/dashboard");
  }, [location])

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/dashboard/profile"),
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between border-b-1 shadow-none border-[#f1f0fd] items-center px-6 py-4 bg-white shadow-sm z-50">
      <div className="flex items-center gap-12">
        <Logo isClickable={true} />
        {isDashboardRoute && <Greeting user={user} />}
      </div>

      {token ? (
        <div className="flex items-center gap-2">
          {!isDashboardRoute  && token && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
          )}
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Avatar
              size={40}
              src={user?.profile_picture || null}
              icon={
                !user?.profile_picture &&
                (user?.first_name ? (
                  `${user?.first_name?.charAt(0)?.toUpperCase() || ''}${
                    user?.last_name?.charAt(0)?.toUpperCase() || ''
                  }`
                ) : (
                  <UserOutlined />
                ))
              }
              className="cursor-pointer border profile-avatar"
            />
          </Dropdown>
        </div>
      ) : (
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            onClick={() => navigate('/register')}
          >
            Sign Up
          </button>
        </div>
      )}
    </header>
  );
}
