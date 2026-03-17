import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  WalletOutlined,
  StarOutlined,
  FileTextOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import {
  Card,
  Avatar,
  Tag,
  Button,
  Row,
  Col,
  Divider,
  Form,
  Input,
  Select,
  Skeleton,
  message,
} from 'antd';
import "./profile.scss";
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, updateProfile } from '@store/authSlice.js';
import _ from 'lodash';
import { getRoleColor } from '@utils/commonFunctions.jsx';
import { fetchSubjects } from '@store/subjectSlice';
import RoleTag from '@components/RoleTag/index.jsx';

const { Option } = Select;
const { TextArea } = Input;

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.auth);
  const { list: subjects } = useSelector((state) => state.subjects);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (!_.isEmpty(profile)) {
      let mergedProfile = { ...profile.user };
      if (profile.teacher) mergedProfile = { ...mergedProfile, ...profile.teacher };
      else if (profile.student) mergedProfile = { ...mergedProfile, ...profile.student };

      setUserProfile(mergedProfile);
      form.setFieldsValue(mergedProfile);
    }
  }, [profile]);

  const handleSave = (values) => {
    const payload = {
      ...userProfile,
      ...values,
      monthly_rate: values.monthly_rate ? Number(values.monthly_rate) : userProfile?.monthly_rate,
    }
    setUserProfile(payload);
    dispatch(updateProfile(payload))
      .unwrap()
      .then(() => {
        message.success("Profile updated successfully!");
      })
      .catch((err) => {
        message.error(err || "Update failed");
      });
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.setFieldsValue(userProfile);
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        {loading ? (
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <div className="form-actions">
              <div className='page-title'>
                Profile
              </div>
              {isEditing ? (
                <div className='flex align-center gap-2'>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit">Save</Button>
                </div>
              ) : (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  Edit Profile
                </Button>
              )}
            </div>
            <Card className="profile-card basic-info-card">
              <div className="profile-header">
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                  style={{ backgroundColor: getRoleColor(userProfile?.role) }}
                >
                  {!userProfile?.profile_image &&
                    `${userProfile?.first_name?.[0]}${userProfile?.last_name?.[0]}`}
                </Avatar>

                <div className="profile-info" style={{ flex: 1 }}>
                  {isEditing ? (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <h2 className="profile-name">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </h2>
                  )}

                  <RoleTag role={userProfile?.role} />

                  {isEditing ? (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[{ required: true, type: "email" }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="phone_number" label="Phone Number">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <div className="contact-info">
                      <div className="contact-item">
                        <MailOutlined className="contact-icon" />
                        <span>{userProfile?.email}</span>
                      </div>
                      <div className="contact-item">
                        <PhoneOutlined className="contact-icon" />
                        <span>{userProfile?.phone_number}</span>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <Form.Item name="bio" label="Bio">
                      <TextArea rows={3} />
                    </Form.Item>
                  ) : (
                    userProfile?.bio && <p className="profile-bio">{userProfile?.bio}</p>
                  )}
                </div>
              </div>
            </Card>

            <Divider />

            {userProfile?.role === "teacher" && (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Languages" className="profile-card">
                    {isEditing ? (
                      <Form.Item name="language" label="Languages">
                        <Select mode="multiple" placeholder="Select languages">
                          <Option value="english">English</Option>
                          <Option value="spanish">Spanish</Option>
                          <Option value="french">French</Option>
                        </Select>
                      </Form.Item>
                    ) : (
                      userProfile?.language?.map((lang) => (
                        <Tag key={lang} color="blue" className="skill-tag">
                          {lang}
                        </Tag>
                      ))
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Subjects" className="profile-card">
                    {isEditing ? (
                      <Form.Item name="subjects" label="Subjects">
                        <Select mode="multiple" placeholder="Select subjects">
                          {subjects.map((s) => (
                            <Option key={s.subject_id} value={s.name}>
                              {s.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ) : (
                      userProfile?.subjects?.map((s) => (
                        <Tag key={s} color="green" className="skill-tag">
                          {s}
                        </Tag>
                      ))
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Education" className="profile-card">
                    {isEditing ? (
                      <>
                        <Form.Item name="qualifications" label="Qualifications">
                          <Input />
                        </Form.Item>
                        <Form.Item name="university" label="University">
                          <Input />
                        </Form.Item>
                      </>
                    ) : (
                      <div className='education-university'>
                        <div><strong>Qualification:</strong> {userProfile?.qualifications}</div>
                        <div><strong>University:</strong> {userProfile?.university}</div>
                      </div>
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Rates" className="profile-card">
                    {isEditing ? (
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="monthly_rate" label="Monthly Rate">
                            <Input type="number" />
                          </Form.Item>
                        </Col>
                      </Row>
                    ) : (
                      <>
                        <div className="pricing-section">
                          <div className="price-item">
                            <WalletOutlined className="price-icon" />
                            <div className="price-details">
                              <span className="price-label">Monthly</span>
                              <span className="price-value">₹{userProfile?.monthly_rate}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
            )}

            {userProfile?.role === "student" && (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Academic Info" className="profile-card" extra={<StarOutlined />}>
                    {isEditing ? (
                      <>
                        <Form.Item name="grade_level" label="Grade Level">
                          <Input />
                        </Form.Item>
                        <Form.Item name="parent_contact" label="Parent Contact">
                          <Input />
                        </Form.Item>
                      </>
                    ) : (
                      <>
                        <div><strong>Grade Level:</strong> {userProfile?.grade_level}</div>
                        <div><strong>Parent Contact:</strong> {userProfile?.parent_contact}</div>
                      </>
                    )}
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Interests" className="profile-card" extra={<HeartOutlined />}>
                    {isEditing ? (
                      <Form.Item name="subjects_interested" label="Subjects Interested">
                        <Select mode="multiple" placeholder="Select interested subjects">
                          {subjects.map((s) => (
                            <Option key={s.subject_id} value={s.name}>
                              {s.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ) : (
                      userProfile?.subjects_interested?.map((sub) => (
                        <Tag key={sub} color="purple">{sub}</Tag>
                      ))
                    )}
                  </Card>
                </Col>

                <Col xs={24}>
                  <Card title="Learning Goals" className="profile-card" extra={<FileTextOutlined />}>
                    {isEditing ? (
                      <Form.Item name="learning_goals" label="Learning Goals">
                        <TextArea rows={3} />
                      </Form.Item>
                    ) : (
                      <p>{userProfile?.learning_goals}</p>
                    )}
                  </Card>
                </Col>
              </Row>
            )}

            {userProfile?.role === "admin" && (
              <Card title="Administration Info" className="profile-card">
                <div><strong>Access Level:</strong> <Tag color="red">Full Access</Tag></div>
                <div><strong>Department:</strong> System Administration</div>
              </Card>
            )}

          </Form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
