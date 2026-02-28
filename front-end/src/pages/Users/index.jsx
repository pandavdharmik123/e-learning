import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Download,
  MoreVertical
} from 'lucide-react';
import './users.scss';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import {
  deleteUser,
  getAllUsers,
  updateUserVerification,
} from '@store/adminSlice.js';
import { DeleteFilled } from '@ant-design/icons';
import { notification, Popconfirm, Select } from 'antd';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');

  const { users: storeUsers } = useSelector((state) => state.admin);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  useEffect(() => {
    if(!_.isEmpty(storeUsers)) {
      setUsers(storeUsers);
    }
  }, [storeUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesVerification =
      verificationFilter === 'ALL' ||
      (verificationFilter === 'VERIFIED' && user.is_verified) ||
      (verificationFilter === 'UNVERIFIED' && !user.is_verified);

    return matchesSearch && matchesRole && matchesVerification;
  });

  const handleVerifyUser = async (user) => {
    await(dispatch(updateUserVerification({ userId: user.user_id, is_verified: !user.is_verified })).unwrap());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteUser = (userId) => {
    try {
      dispatch(deleteUser(userId)).unwrap();
      notification.success({ message: 'User deleted successfully.' });
    } catch (error) {
      notification.error({ message: error.message || 'Error while deleting user!' });
    }

  }

  return (
    <div className="admin-users-page">
      <div className="container">
        <div className="page-title">Users</div>
        <div className="filters-section">
          <div className="filters-content">
            <div className="filters-group">
              <div className="search-input">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-field"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                className="filter-select"
                value={roleFilter}
                onChange={(value) => setRoleFilter(value)}
              >
                <Select.Option value="ALL">All Roles</Select.Option>
                <Select.Option value="teacher">Teacher</Select.Option>
                <Select.Option value="student">Student</Select.Option>
              </Select>

              <Select
                className="filter-select"
                value={verificationFilter}
                onChange={(value) => setVerificationFilter(value)}
              >
                <Select.Option value="ALL">All Status</Select.Option>
                <Select.Option value="VERIFIED">Verified</Select.Option>
                <Select.Option value="UNVERIFIED">Unverified</Select.Option>
              </Select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="users-table">
              <thead className="table-header">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Role</th>
                <th className="table-th">Contact</th>
                <th className="table-th">Status</th>
                <th className="table-th">Created Date</th>
                <th className="table-th">Actions</th>
              </tr>
              </thead>
              <tbody className="table-body">
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="table-row">
                  <td className="table-td">
                    <div className="user-info">
                      <div className="user-avatar">
                        <User className="avatar-icon" />
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                      <span className={`role-badge role-badge--${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    {user.role === 'TEACHER' && user.teacher && (
                      <div className="role-details">
                        {user.teacher.subjects.join(', ')} • {user.teacher.experience_years} years
                      </div>
                    )}
                    {user.role === 'STUDENT' && user.student && (
                      <div className="role-details">
                        {user.student.grade_level}
                      </div>
                    )}
                  </td>
                  <td className="table-td">
                    <div className="contact-info">
                      <div className="contact-item">
                        <Mail className="contact-icon" />
                        {user.email}
                      </div>
                      {user.phone_number && (
                        <div className="contact-item contact-item--secondary">
                          <Phone className="contact-icon" />
                          {user.phone_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="status-wrapper">
                      {user.is_verified ? (
                        <span className="status-badge status-badge--verified">
                            <CheckCircle className="status-icon" />
                            Verified
                          </span>
                      ) : (
                        <span className="status-badge status-badge--unverified">
                            <XCircle className="status-icon" />
                            Unverified
                          </span>
                      )}
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="date-info">
                      <Calendar className="date-icon" />
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="action-buttons">
                      <button
                        onClick={() => handleVerifyUser(user)}
                        className={`action-btn ${
                          user.is_verified
                            ? 'action-btn--unverify'
                            : 'action-btn--verify'
                        }`}
                        title={user.is_verified ? 'Unverify user' : 'Verify user'}
                      >
                        {user.is_verified ? (
                          <span>Reject</span>
                        ) : (
                          <span>Approve</span>
                        )}
                      </button>
                      <Popconfirm
                        title="Delete the user"
                        description="Are you sure to delete this user?"
                        icon={<XCircle className="text-red-600 mr-2" />}
                        okText='Yes'
                        cancelText={'No'}
                        okButtonProps={{ style: { backgroundColor: 'red' } }}
                        onConfirm={() => handleDeleteUser(user.user_id)}
                      >
                        <button style={{padding: 0}}>
                          <DeleteFilled className="text-red-600"/>
                        </button>
                      </Popconfirm>

                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;