import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Select,
} from 'antd';
import { LinkOutlined, UserOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';

const { TextArea } = Input;
const { Option } = Select;
import dayjs from 'dayjs';
import { isEmpty } from 'lodash/lang.js';

const ClassModal = ({
  isModalVisible,
  setIsModalVisible,
  handleCreateClass,
  handleUpdateClass,
  students,
  editingClass,
  setSelectedClass,
  isEdit
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isEmpty(editingClass)) {
      form.setFieldsValue({
        ...editingClass,
        scheduled_time: editingClass.scheduled_time
          ? dayjs(editingClass.scheduled_time)
          : null,
      });
    } else {
      form.resetFields();
    }
  }, [editingClass, form]);

  const onSubmit = (values) => {
    if (!isEmpty(editingClass)) {
      handleUpdateClass( editingClass.class_id, { ...editingClass, ...values });
    } else {
      handleCreateClass(values);
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Modal
      title={isEdit ? 'Edit Class' : 'Create New Class'}
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedClass({});
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Subject/Title"
          name="title"
          rules={[{ required: true, message: 'Please enter class title' }]}
        >
          <Input placeholder="Enter class title" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Enter class description (optional)" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Scheduled Date & Time"
              name="scheduled_time"
              rules={[
                { required: true, message: 'Please select date and time' },
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Duration (minutes)"
              name="duration"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber
                min={15}
                max={180}
                placeholder="60"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

          <Form.Item
            label="Select Students"
            name="student_ids"
            rules={[{ required: true, message: 'Please select at least one student' }]}
          >
            <Select
              placeholder="Choose students"
              optionFilterProp="children"
              showSearch
              mode="multiple"            // 👈 THIS makes it multi-select
              allowClear
            >
              {students?.map((s) => (
                <Option key={s.student_id} value={s.student_id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined style={{ color: '#667eea' }} />
                    <span>
                      {s.user.first_name} {s.user.last_name}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

        <Form.Item label="Meeting Link" name="zoom_link">
          <Input
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            prefix={<LinkOutlined />}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? 'Update Class' : 'Create Class'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ClassModal;
