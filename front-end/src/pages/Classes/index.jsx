import React, { useEffect, useState } from 'react';
import './classes.scss';
import ClassCard from '@components/ClassCard/index.jsx';
import { Button, Modal, Form, Input, DatePicker, InputNumber, Space, message } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  createClass,
  fetchStudentClasses,
  fetchTeacherClasses,
  updateClass,
} from '@store/classSlice';
import _ from 'lodash';
import { fetchTeacherStudents } from '@store/teacherSlice.js';
import CreateClass from '@components/CreateClass';
import { isEmpty } from 'lodash/lang.js';
import EmptyClassesState from '@pages/Classes/EmptyClassesState.jsx';


const ClassCardDemo = () => {
  const [sampleClasses, setSampleClasses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState({});
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { classes } = useSelector((state) => state.classes);
  const { students } = useSelector((state) => state.teachers);


  useEffect(() => {
    if(user?.role) {
      if(user?.role === 'teacher') {
        dispatch(fetchTeacherStudents());
        dispatch(fetchTeacherClasses());
      } else if(user?.role === 'student') {
        dispatch(fetchStudentClasses())
      }
    }
  }, [user?.role]);

  useEffect(() => {
    if(!_.isEmpty(classes)) {
      setSampleClasses(classes);
    } else {
      setSampleClasses([]);
    }
  }, [classes]);


  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEndTime = (startTime, duration) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCreateClass = async (values) => {

    const payload = { ...values, scheduled_time: new Date(values.scheduled_time) };
    try{
      const response = await (dispatch(createClass(payload)).unwrap());
      if(response?.class_id) {
        message.success('Class Created successfully.');
        setIsModalVisible(false);
      }
    } catch (e) {
      message.error('Error creating Class!');
    }
  }

  const handleUpdateClass = (classId, values) => {
    dispatch(updateClass({ id: classId, updates: values }));
  }

  const isExpiredClass = (item) => {
    if (!item?.scheduled_time || !item?.duration) return false;

    const start = new Date(item.scheduled_time);
    const end = new Date(start.getTime() + item.duration * 60000);
    const now = new Date();

    return now > end;
  };

  return (
    <div className="class-cards-container">
      <div className="class-cards-header">
        <p className="page-title">Classes</p>
        <div className="class-cards-actions">
          {user?.role && user?.role === 'teacher' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="create-button"
              onClick={() => setIsModalVisible(true)}
            >
              Create Class
            </Button>
          )}
        </div>
      </div>
      <div className="cards-wrapper">
        {!isEmpty(sampleClasses) ?
          sampleClasses.map(classItem => (
          <ClassCard
            key={classItem.class_id}
            classItem={classItem}
            user={user}
            title={classItem.title}
            date={formatDate(classItem.scheduled_time)}
            startTime={formatTime(classItem.scheduled_time)}
            endTime={getEndTime(classItem.scheduled_time, classItem.duration)}
            meetingLink={classItem.zoom_link}
            isExpired={isExpiredClass(classItem)}
            setSelectedClass={setSelectedClass}
            setIsModalVisible={setIsModalVisible}
          />
        )) : <EmptyClassesState userRole={user.role} />}
      </div>

      <CreateClass
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        handleCreateClass={handleCreateClass}
        handleUpdateClass={handleUpdateClass}
        students={students}
        editingClass={selectedClass}
        setSelectedClass={setSelectedClass}
        isEdit={!isEmpty(selectedClass)}
      />

    </div>
  );
};

export default ClassCardDemo;