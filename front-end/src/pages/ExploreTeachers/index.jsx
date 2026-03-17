import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Select, Spin, Empty, message, Typography, } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './exploreTeacher.scss';
import { fetchExploreTeachers } from '@store/teacherSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash/lang.js';
import { fetchHiredTeachers, hireTeacher } from '@store/studentSlice.js';
import TeacherCard from '@components/TeacherCard/index.jsx';
const { Search } = Input;
const { Option } = Select;

const ExploreTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [hiringLoading, setHiringLoading] = useState({});

  const { teachers: storeTeachers, studentSubjects, loading } = useSelector((state) => state.teachers);
  const { user } = useSelector((state) => state.auth);
  const { hiredTeachers } = useSelector((state) => state.students);

  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(fetchExploreTeachers());
      dispatch(fetchHiredTeachers());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!isEmpty(storeTeachers)) {
      setTeachers(storeTeachers);
      setFilteredTeachers(storeTeachers);
    }
  }, [storeTeachers]);

  useEffect(() => {
    let filtered = teachers;

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        `${teacher.user?.first_name} ${teacher.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.subjects || []).some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.qualifications || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(teacher =>
        teacher.subjects && teacher.subjects.includes(selectedSubject)
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(teacher =>
        (teacher.language || []).includes(selectedLanguage)
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

  return (
    <div className="explore-teachers-page normal">
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
              {studentSubjects.map((name) => (
                <Option key={name} value={name}>
                  {name}
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
        ) : filteredTeachers.length === 0 ? (
          <Empty
            description="No teachers found matching your criteria"
            className="empty-state"
          />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredTeachers.map((teacher) => (
              <Col key={teacher.teacher_id} xs={24} sm={12} lg={8} xl={6}>
                <TeacherCard teacher={teacher}  isExploreTeachers={true} handleHireTeacher={handleHireTeacher} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ExploreTeachers;