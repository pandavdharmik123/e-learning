import { message, Popconfirm } from 'antd';
import editIcon from '@assets/edit-icon.png'
import { Image, XCircle } from 'lucide-react';
import { DeleteFilled, EditOutlined, EditTwoTone } from '@ant-design/icons';
import React from 'react';
import { deleteClass } from '@store/classSlice.js';
import { useDispatch } from 'react-redux';

const ClassCard = ({
  user = {},
  classItem = {},
  title = "Math",
  date = "7 Aug 2023",
  startTime = "04:00 PM",
  endTime = "05:00 PM",
  meetingLink = "https://meet.google.com",
  isExpired = true,
  setSelectedClass = (prev) => {},
  setIsModalVisible = (prev) => {}
}) => {
  const dispatch = useDispatch();

  const handleStartClass = () => {
    if(isExpired) {
      message.error("Class is expired! Please connect to teacher!");
      return;
    }
    if(meetingLink) {
      window.open(meetingLink, '_blank')
    } else {
      message.error("Missing Meeting Link!");
    }
  };

  const handleDelete = (classItem) => {
    dispatch(deleteClass(classItem.class_id));
  };

  return (
    <div className="single-class-card">
      <div className="card-left-section">
        <h3 className="subject-title">{title}</h3>
        <p className="class-date">{date}</p>
      </div>

      <div className="card-center-section">
        <div className="time-info">
          <div className="time-block">
            <span className="time-value">{startTime}</span>
            <span className="time-label">Time Start</span>
          </div>
          <div className="vertical-line"></div>
          <div className="time-block">
            <span className="time-value">{endTime}</span>
            <span className="time-label">Time End</span>
          </div>
        </div>
      </div>

      <div className="card-right-section">
        <button className="start-class-button" onClick={handleStartClass}>
          {isExpired
            ? 'Class Expired'
            : user?.role && user?.role === 'teacher'
            ? 'Start Class'
            : 'Join Class'}
        </button>
        <div className="meeting-link-container">
          <span className="meeting-link">{meetingLink}</span>
          <svg
            className="external-link-icon"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15,3 21,3 21,9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </div>
      </div>
      {user?.role && user?.role === 'teacher' && (
        <>
          <div
            onClick={() => {
              setSelectedClass(classItem);
              setIsModalVisible(true);
            }}
          >
            <EditTwoTone  />
          </div>
          <Popconfirm
            title="Delete the class"
            description="Are you sure to delete this class?"
            icon={<XCircle className="text-red-600 mr-2" />}
            okText='Yes'
            cancelText={'No'}
            okButtonProps={{ style: { backgroundColor: 'red' } }}
            onConfirm={() => handleDelete(classItem)}
          >
              <DeleteFilled className="text-red-600 w-100 h-100" />
          </Popconfirm>
        </>

      )}
    </div>
  );
};

export default ClassCard;