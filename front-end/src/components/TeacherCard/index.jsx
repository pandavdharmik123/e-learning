import {
  Avatar,
  Button,
  Card,
  Divider,
  Modal,
  Rate,
  Tag,
  Typography,
} from 'antd';
import { BookOutlined, DollarOutlined, GlobalOutlined, TeamOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import React from 'react';
import { useSelector } from 'react-redux';
const { Text, Title, Paragraph } = Typography;

const getSubjectColor = (subject) => {
  const colors = {
    'Mathematics': 'blue',
    'Physics': 'purple',
    'Chemistry': 'green',
    'Biology': 'cyan',
    'Science': 'geekblue',
    'English Literature': 'magenta',
    'Writing': 'orange'
  };
  return colors[subject] || 'default';
};


export const TeacherCard = ({ teacher, isExploreTeachers = false, handleHireTeacher, isDashboard = false }) => {

  const { loading } = useSelector((state) => state.students);

  const confirmHireTeacher = (teacher) => {
    Modal.confirm({
      title: 'Hire Teacher',
      content: (
        <div>
          <p>Are you sure you want to hire <strong>{teacher?.user?.first_name} {teacher?.user?.last_name}</strong>?</p>
          <p>Hourly Rate: <strong>₹{teacher?.hourly_rate}</strong></p>
          <p>Monthly Rate: <strong>₹{teacher?.monthly_rate}</strong></p>
        </div>
      ),
      onOk: () => handleHireTeacher(teacher?.teacher_id),
      okText: 'Hire Now',
      cancelText: 'Cancel',
      okButtonProps: {
        className: 'hire-confirm-btn',
      }
    });
  };
  return (
    <Card
      key={teacher?.user_id || teacher?.teacher_id}
      className="teacher-card"
      hoverable
      cover={
        <div className="card-header">
          <Avatar
            size={60}
            src={teacher?.profile_picture || teacher?.user?.profile_picture}
            icon={<UserOutlined />}
            className="teacher-avatar"
          />
          <div className="teacher-basic-info">
            <Title level={4} className="teacher-name">
              {teacher?.first_name || teacher?.user?.first_name} {teacher?.last_name || teacher?.user?.last_name}
            </Title>
            <div className="rating-section">
              <Rate
                disabled
                defaultValue={teacher?.rating_average || teacher?.teacher?.rating_average}
                className="teacher-rating"
              />
              <Text className="rating-text">({teacher?.rating_average || teacher?.teacher?.rating_average || 0})</Text>
            </div>
          </div>
        </div>
      }
    >
      <div className="card-content">
        <div className="subjects-section">
          <BookOutlined className="section-icon" />
          <div className="subjects-list">
            {(teacher?.subjects || teacher?.teacher?.subjects)?.map((subject, index) => (
              <Tag
                key={index}
                color={getSubjectColor(subject)}
                className="subject-tag"
              >
                {subject}
              </Tag>
            ))}
          </div>
        </div>

        <div className="languages-section">
          <GlobalOutlined className="section-icon" />
          <div className="languages-list">
            {(teacher?.language || teacher?.teacher?.language)?.map((lang, index) => (
              <Tag key={index} className="language-tag">
                {lang}
              </Tag>
            ))}
          </div>
        </div>

        <div className="qualifications-section">
          <TrophyOutlined className="section-icon" />
          <Text className="qualifications-text">{teacher?.qualifications || teacher?.teacher?.qualifications}</Text>
        </div>

        <div className="experience-section">
          <TeamOutlined className="section-icon" />
          <Text className="experience-text">
            {teacher?.experience_years || teacher?.teacher?.experience_years || 1} years • {teacher?.teacher?.total_students || teacher?.total_students} students
            taught
          </Text>
        </div>

        {!isDashboard && (
          <>

            <Divider className="card-divider" />

            <div className="bio-section">
              <Paragraph className="bio-text" ellipsis={{ rows: 2 }}>
                {teacher?.bio}
              </Paragraph>
            </div>
            <div className="pricing-section">
              <div className="price-item">
                <DollarOutlined className="price-icon" />
                <div className="price-details">
                  <Text className="price-label">Hourly</Text>
                  <Text className="price-value">₹{teacher?.hourly_rate}</Text>
                </div>
              </div>
              <div className="price-item">
                <DollarOutlined className="price-icon" />
                <div className="price-details">
                  <Text className="price-label">Monthly</Text>
                  <Text className="price-value">₹{teacher?.monthly_rate}</Text>
                </div>
              </div>
            </div>
          </>
        )}

        {isExploreTeachers && (
          <Button
            type="primary"
            size="large"
            className="hire-btn"
            onClick={() => confirmHireTeacher(teacher)}
            loading={loading}
            block
          >
            Hire Teacher
          </Button>
        )}
      </div>
    </Card>
  )
};

export default TeacherCard;