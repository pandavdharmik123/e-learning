import React, { useState, useEffect } from 'react';
import {
  Button,
  Row,
  Col,
  Input,
  Select,
  Spin,
  message,
} from 'antd';
import {
  SearchOutlined,
  TeamOutlined,
  BookOutlined,
} from '@ant-design/icons';
import '../ExploreTeachers/exploreTeacher.scss';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash/lang.js';
import { fetchSubjects } from '@store/subjectSlice';
import {
  dismissTeacher,
  fetchHiredTeachers,
  hireTeacher,
} from '@store/studentSlice.js';
import TeacherCard from '@components/TeacherCard/index.jsx';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

const HiredTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [hiringLoading, setHiringLoading] = useState({});

  const { hiredTeachers, loading } = useSelector((state) => state.students);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: subjects } = useSelector((state) => state.subjects);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchHiredTeachers());
  }, [dispatch]);

  useEffect(() => {
    if(!isEmpty(hiredTeachers)) {
      setTeachers(hiredTeachers);
      setFilteredTeachers(hiredTeachers);
    } else {
      setTeachers([]);
      setFilteredTeachers([]);
    }
  }, [hiredTeachers]);

  useEffect(() => {
    let filtered = teachers;

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        `${teacher.user.first_name} ${teacher.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        teacher.qualifications?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(teacher =>
        teacher.subjects && teacher.subjects.includes(selectedSubject)
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(teacher =>
        teacher.language?.includes(selectedLanguage)
      );
    }

    setFilteredTeachers(filtered);
  }, [searchTerm, selectedSubject, selectedLanguage, teachers]);


  const handleHireTeacher = async (teacherId) => {
    try {
      await dispatch(hireTeacher(teacherId)).unwrap();

      setTeachers(prev => prev.filter(teacher => teacher.teacher_id !== teacherId));
      setFilteredTeachers(prev => prev.filter(teacher => teacher.teacher_id !== teacherId));

      message.success('Teacher hired successfully!');
    } catch (error) {
      message.error(error || 'Failed to hire teacher. Please try again.');
    } finally {
      setHiringLoading({ ...hiringLoading, [teacherId]: false });
    }
  };

  const handleDismissTeacher = async (teacherId) => {
    try {
      await dispatch(dismissTeacher(teacherId)).unwrap();

      setTeachers(prev => prev.filter(t => t.teacher_id !== teacherId));
      setFilteredTeachers(prev => prev.filter(t => t.teacher_id !== teacherId));

      message.success("Teacher dismissed successfully.");
    } catch (error) {
      message.error(error || "Failed to dismiss teacher.");
    }
  };

  const hasNoHiredTeachers = !loading && teachers.length === 0;

  return (
    <div className="explore-teachers-page">
      {hasNoHiredTeachers ? (
        <div className="empty-hired-container">
          <div className="icon-wrapper">
            <div className="main-icon-circle">
              <TeamOutlined className="team-icon" />
            </div>
            <div className="floating-accent">
              <BookOutlined className="accent-icon" />
            </div>
          </div>
          <h2 className="empty-title">No Teachers Hired Yet</h2>
          <p className="empty-description">
            You haven't hired any teachers yet. Explore our talented teachers and find the perfect match for your learning goals.
          </p>
          <Button
            type="primary"
            size="large"
            className="explore-btn"
            onClick={() => navigate('/explore/teachers')}
          >
            Explore Teachers
          </Button>
          <div className="decorative-blob blob-1" />
          <div className="decorative-blob blob-2" />
        </div>
      ) : (
        <>
          <div className="filters-section">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Search
                  placeholder="Search teachers, subjects..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  className="filter-select"
                  placeholder="Subject"
                >
                  <Option value="all">All Subjects</Option>
                  {subjects.map((s) => (
                    <Option key={s.subject_id} value={s.name}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  className="filter-select"
                  placeholder="Language"
                >
                  <Option value="all">All Languages</Option>
                  <Option value="English">English</Option>
                  <Option value="Spanish">Spanish</Option>
                  <Option value="French">French</Option>
                  <Option value="Mandarin">Mandarin</Option>
                </Select>
              </Col>
            </Row>
          </div>

          <div className="teachers-grid">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {filteredTeachers.map((teacher) => (
                  <Col key={teacher.teacher_id} xs={24} sm={12} lg={8} xl={6}>
                    <TeacherCard
                      teacher={teacher}
                      handleHireTeacher={handleHireTeacher}
                      handleDismissTeacher={handleDismissTeacher}
                      isHiredTeacher={true}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HiredTeachers;