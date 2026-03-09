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
  const [subjects, setSubjects] = useState([]);

  const { students: storeStudents } = useSelector(state => state.teachers);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeacherStudents());
  }, []);

  useEffect(() => {
    if(!_.isEmpty(storeStudents)) {
      const subjects = _.uniq(storeStudents.reduce((acc, student) => {
        return [...acc, ...(student?.subjects_interested || [])]
      } , []));
      setStudents(storeStudents);
      setFilteredStudents(storeStudents);
      setSubjects(subjects);
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
      student?.subjects_interested?.some(subj => 
        subj.toLowerCase().replace(/\s+/g, '_') === subject.toLowerCase().replace(/\s+/g, '_')
      )
    );
    setFilteredStudents(filtered);
  }

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
            defaultValue={selectedSubject}
            value={selectedSubject}
            suffixIcon={<FilterOutlined />}
            className="subject-filter"
            onChange={handleSelectSubject}
            labelRender={(props) => _.capitalize(props.value)}
          >
            {subjects.map(subject => (
              <Option key={subject} value={subject}>{_.capitalize(subject)}</Option>
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