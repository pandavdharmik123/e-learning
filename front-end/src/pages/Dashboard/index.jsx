import React, { useEffect, useState } from 'react';
import {
  Users,
  Book,
  FileText,
  Calendar,
  MoreHorizontal,
  Download,
  Eye,
} from 'lucide-react';
import './dashboard.scss';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StudentCard from "@components/StudentCard/index.jsx";
import { fetchTeacherStudents } from '@store/teacherSlice.js';
import { fetchStudentClasses, fetchTeacherClasses } from '@store/classSlice.js';
import {fetchHiredTeachers} from "@store/studentSlice.js";
import {getAllUsers} from "@store/adminSlice.js";
import TeacherCard from "@components/TeacherCard/index.jsx";

const DashboardPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  // const { students: storeStudents } = useSelector(state => state.teachers);
  const { user } = useSelector((state) => state.auth);

  async function loadUsers(userRole) {
      if(userRole) {
          if(userRole === 'teacher') {
              const result = await dispatch(fetchTeacherStudents()).unwrap();
              setStudents(result);
          } else if(userRole === 'student') {
              const result = await dispatch(fetchHiredTeachers()).unwrap();
              setTeachers(result);
          } else if(userRole === 'admin') {
              const result = await dispatch(getAllUsers()).unwrap();
              setStudents(result.filter(user => user.role === 'student'));
              setTeachers(result.filter(user => user.role === 'teacher'));
          }
      }
  }
  const dispatch = useDispatch();
    useEffect(() => {
        loadUsers(user?.role);
    }, [user?.role]);

    const handleAll = () => {
        if(user?.role === 'teacher') {
            navigate('/dashboard/students');
        } else if(user?.role === 'student') {
            navigate('/dashboard/teachers');
        } else if(user?.role === 'admin') {
            navigate('/dashboard/users');
        }
    }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="content-area">
          <main className="main-dashboard">
            <div className="page-title">Dashboard</div>
            <div className="quote-container">
              <h3 className="quote-title">{'Quote of the day'}</h3>
              <p className="quote-text">
                Where can we find the courage to act in spite of fear? Trying to
                eliminate that which we react to fearfully is a fool's errand
                because it locates the source of our fear outside ourselves,
                rather than within our own hearts.
              </p>
            </div>

            <div className="dashboard-grid">
              {['admin', 'teacher'].includes(user?.role) && (
                  <div className="schedule-section">
                      <div className='section-header'>
                          <span className='section-title'>Students</span>
                          <span className='view-all-link' onClick={handleAll}>View all</span>
                      </div>
                      <div className='flex gap-2'>
                          {students.slice(0,3).map((student, index) => (
                              <StudentCard key={index} student={student} />
                          ))}
                      </div>
                  </div>
              )}
              {['admin', 'student'].includes(user?.role) && (
                  <div className="schedule-section">
                        <div className='section-header'>
                            <span className='section-title'>Teachers</span>
                            <span className='view-all-link' onClick={handleAll}>View all</span>
                        </div>
                        <div className='flex gap-2'>
                            {teachers?.slice(0,2).map((teacher, index) => (
                                <TeacherCard key={index} teacher={teacher} isDashboard={true}/>
                            ))}
                        </div>
                  </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
