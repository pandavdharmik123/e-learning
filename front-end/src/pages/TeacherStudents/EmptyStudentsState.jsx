import React from 'react';
import { UserAddOutlined, ReadOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const EmptyStudentsState = () => {
  return (
    <div className="empty-students-container">
      <div className="icon-wrapper">
        <div className="main-icon-circle">
          <UserAddOutlined className="user-add-icon" />
        </div>

        <div className="floating-book">
          <ReadOutlined className="book-icon" />
        </div>
      </div>

      <h2 className="empty-title">
        No Students Enrolled
      </h2>

      <p className="empty-description">
        Your student roster is currently empty. Begin enrolling students to start building your classroom community and track their progress.
      </p>

      <div className="decorative-blob blob-1" />
      <div className="decorative-blob blob-2" />
    </div>
  );
};

export default EmptyStudentsState;