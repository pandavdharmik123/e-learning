import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Button,
  Row,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  CalendarOutlined,
  FilterOutlined
} from '@ant-design/icons';
import './teacherStudents.scss';
import StudentCard from '@components/StudentCard';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeacherStudents } from '@store/teacherSlice';
import { fetchSubjects } from '@store/subjectSlice';
import _ from 'lodash';
import { isEmpty } from 'lodash/lang.js';
import EmptyStudentsState from '@pages/TeacherStudents/EmptyStudentsState.jsx';

const { Search } = Input;
const { Option } = Select;

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const { students: storeStudents } = useSelector((state) => state.teachers);
  const { list: subjects } = useSelector((state) => state.subjects);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeacherStudents());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (!_.isEmpty(storeStudents)) {
      setStudents(storeStudents);
      setFilteredStudents(storeStudents);
    }
  }, [storeStudents]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = students.filter(student =>
      student?.user?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
      student?.user?.last_name?.toLowerCase().includes(value.toLowerCase()) ||
      student?.user?.email?.toLowerCase().includes(value.toLowerCase()) ||
      student?.subjects_interested.includes(value.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    if (!subject || subject === '') {
      setFilteredStudents(students);
      return;
    }
    const filtered = students.filter(student =>
      student?.subjects_interested?.includes(subject)
    );
    setFilteredStudents(filtered);
  };

  return (
    <div className="student-management-page">
      <div className="page-header">
        <p className="page-title">Student</p>

        <div className="header-controls">
          <Search
            placeholder="Search Students"
            prefix={<SearchOutlined />}
            onChange={e => handleSearch(e.target.value)}
            className="search-input"
          />

          <Select
            value={selectedSubject}
            suffixIcon={<FilterOutlined />}
            className="subject-filter"
            onChange={handleSelectSubject}
            placeholder="Filter by subject"
            allowClear
          >
            {subjects.map((s) => (
              <Option key={s.subject_id} value={s.name}>{s.name}</Option>
            ))}
          </Select>

        </div>
      </div>

      <div className="students-grid">
        {!isEmpty(filteredStudents) ?
          filteredStudents.map((student, index) => (
          <StudentCard key={index} student={student} />
        )): <EmptyStudentsState  />}
      </div>
    </div>
  );
};

export default TeacherStudents;