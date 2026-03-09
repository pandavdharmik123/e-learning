import { Avatar, Card, Col, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React from 'react';
import _ from 'lodash';
import { formatDate } from '@utils/commonFunctions.jsx';
import { formatSubject } from '@constants/subjects';
import './teacherStudents.scss';

const { Text, Title } = Typography;
const getSubjectClass = (subject) => {
  const classes = {
    'Math': 'math',
    'Physics': 'physics'
  };
  return classes[subject] || 'default';
};


const StudentCard = ({ student }) => (
    <Card className="student-card">
      <div className="student-info">
        <Avatar
          size={64}
          src={student.avatar}
          icon={<UserOutlined />}
          className="student-avatar"
        />

        <div className="student-details">
          <Title level={5} className="student-name">
            {student?.first_name || student?.user?.first_name || ''} {student?.last_name || student?.user?.last_name || ''}
          </Title>

          <Text className="student-email">{student?.email || student?.user?.email || ''}</Text>

          <Text className="student-phone">+91 {student?.phone_number || student?.user?.phone_number}</Text>

          <div className="subject-tags">
            {(student.subjects_interested || student?.student?.subjects_interested)?.map((subject, index) => (
              <Tag
                key={index}
                className={`subject-tag ${getSubjectClass(formatSubject(subject))}`}
              >
                {formatSubject(subject)}
              </Tag>
            ))}
          </div>

          <Text className="join-date">Joined on {formatDate(student?.created_at || student?.user?.created_at || '')}</Text>
        </div>
      </div>
    </Card>
);

export default StudentCard;