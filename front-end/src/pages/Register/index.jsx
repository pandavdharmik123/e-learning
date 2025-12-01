import React, { useState } from "react";
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import {
  Steps,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  notification,
} from 'antd';
import "./register.scss";
import { useDispatch } from 'react-redux';
import { register } from '@store/authSlice.js'

const { Option } = Select;

const RegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({});
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleFinish = (values) => {
    const payload = { ...formData, ...values };
    if(values.hourly_rate) {
      payload.hourly_rate = Number(values.hourly_rate);
    }
    if(values.monthly_rate) {
      payload.monthly_rate = Number(values.monthly_rate);
    }
    console.log('payload', payload);
    setFormData({...payload});
    nextStep();
  };

  const handleSubmit = async () => {
    const response = await dispatch(register(formData));

    if(response?.error?.message) {
      notification.error({ message: response.payload });
    } else if(response.payload.token && response.payload.user) {
      notification.success({ message: "User Created Successfully. Please wait for approval from admin!" });
    }
  };

  const steps = [
    {
      title: "Primary Details",
      icon: <UserOutlined />,
      content: (
        <div className="step-container">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="registration-form"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: "Please select a role" }]}
                >
                  <Select placeholder="Select role" onChange={setRole}>
                    <Option value="student">Student</Option>
                    <Option value="teacher">Teacher</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="first_name"
                  rules={[{ required: true, message: "First name required" }]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="last_name"
                  rules={[{ required: true, message: "Last name required" }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, type: "email", message: "Valid email required" }]}
                >
                  <Input placeholder="abcdef@abc.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone No."
                  name="phone_number"
                  rules={[{ required: true, message: "Phone number required" }]}
                >
                  <Input placeholder="Enter your contact no." />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, min: 8, message: "Min 8 characters" }]}
                >
                  <Input.Password placeholder="*******" />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Button type="primary" htmlType="submit" className="primary-btn">
                  Next
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      ),
    },
    {
      title: "Create Account",
      icon:
        role === "teacher" ? (
          <BookOutlined />
        ) : role === "student" ? (
          <TeamOutlined />
        ) : (
          <SolutionOutlined />
        ),
      content: (
        <div className="step-container">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="registration-form"
          >
            {role === "teacher" && (
              <>
                    <Form.Item
                      label="Languages"
                      name="language"
                      rules={[{ required: true }]}
                    >
                      <Select mode="multiple" placeholder="Select preferred languages">
                        <Option value="english">English</Option>
                        <Option value="spanish">Spanish</Option>
                        <Option value="french">French</Option>
                      </Select>
                    </Form.Item>


                    <Form.Item
                      label="Subjects"
                      name="subjects"
                      rules={[{ required: true }]}
                    >
                      <Select mode="multiple" placeholder="Select subjects">
                        <Option value="mathematics">Mathematics</Option>
                        <Option value="science">Science</Option>
                        <Option value="english">English</Option>
                      </Select>
                    </Form.Item>


                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Education"
                      name="qualifications"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Educational Degree" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="University" name="university">
                      <Input placeholder="University Name" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      type={'number'}
                      label="Hourly Rate"
                      name="hourly_rate"
                      rules={[{ required: true }]}
                    >
                      <Input type={'number'} placeholder="Hourly Rate" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item type={'number'} label="Monthly Rate" name="monthly_rate" rules={[{ required: true }]}>
                      <Input type={'number'}  placeholder="Monthly Rate" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {role === "student" && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Grade Level" name="grade_level">
                      <Input placeholder="Enter your grade level" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Parent Contact" name="parent_contact">
                      <Input placeholder="Parent contact details" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Subjects Interested"
                      name="subjects_interested"
                    >
                      <Select mode="multiple" placeholder="Select interested subjects">
                        <Option value="mathematics">Mathematics</Option>
                        <Option value="science">Science</Option>
                        <Option value="english">English</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Learning Goals" name="learning_goals">
                      <Input.TextArea className='text-area' placeholder="Enter your learning goals" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            <div className="form-actions">
              <Button onClick={prevStep} className="secondary-btn">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="primary-btn">
                Create
              </Button>
            </div>
          </Form>
        </div>
      ),
    },
    {
      title: "Summary",
      icon: <SolutionOutlined />,
      content: (
        <div className="step-container">
          <div className="form-summary">
            <p><strong>First Name:</strong> {formData.first_name}</p>
            <p><strong>Last Name:</strong> {formData.last_name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone No:</strong> {formData.phone_number}</p>
            <p><strong>Role:</strong> {formData.role}</p>
            {role === "teacher" && (
              <>
                <p><strong>Languages:</strong> {formData.language?.join(", ")}</p>
                <p><strong>Subjects:</strong> {formData.subjects?.join(", ")}</p>
                <p><strong>Education:</strong> {formData.qualifications}</p>
                <p><strong>University:</strong> {formData.university}</p>
                <p><strong>Hourly Rate:</strong> {formData.hourly_rate}</p>
                <p><strong>Monthly Rate:</strong> {formData.monthly_rate}</p>
              </>
            )}
            {role === "student" && (
              <>
                <p><strong>Grade Level:</strong> {formData.grade_level}</p>
                <p><strong>Parent Contact:</strong> {formData.parent_contact}</p>
                <p><strong>Subjects Interested:</strong> {formData.subjects_interested?.join(", ")}</p>
                <p><strong>Learning Goals:</strong> {formData.learning_goals}</p>
              </>
            )}
            <Button type="primary" className="primary-btn" onClick={handleSubmit}>
              Confirm Registration
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="registration-container">
      <main className="main-content">
        <div className="content-wrapper">
          <div className="form-section">
            <Steps current={currentStep} items={steps.map(({ title, icon }) => ({ title, icon }))} />
            <div className="steps-content">{steps[currentStep].content}</div>
          </div>
          <div className="illustration-section">
            <div className="illustration-content">
              <div className="brand-logo">
                <div className="brand-icon">🌐</div>
                <h1 className="brand-title">E-Learning</h1>
              </div>
              <div className="floating-element">✨</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;
