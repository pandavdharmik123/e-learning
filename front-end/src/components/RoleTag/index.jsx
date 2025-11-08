import { getRoleColor, getRoleIcon } from '@utils/commonFunctions.jsx';
import { Tag } from 'antd';
import React from 'react';

export default function RoleTag({ role }) {
  return (
    <Tag
      icon={getRoleIcon(role)}
      color={getRoleColor(role)}
      className="role-tag"
    >
      {role?.charAt(0)?.toUpperCase() +
        role?.slice(1)}
    </Tag>
  )
}