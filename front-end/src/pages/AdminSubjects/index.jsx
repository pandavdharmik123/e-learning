import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
  Space,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '@store/subjectSlice';
import './adminSubjects.scss';

const { Search } = Input;
const { Text } = Typography;

const AdminSubjects = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { list: subjects, loading } = useSelector((state) => state.subjects);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSubject(record);
    form.setFieldsValue({ name: record.name });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingSubject) {
        await dispatch(
          updateSubject({ subject_id: editingSubject.subject_id, name: values.name.trim() })
        ).unwrap();
        message.success('Subject updated successfully');
      } else {
        await dispatch(createSubject({ name: values.name.trim() })).unwrap();
        message.success('Subject created successfully');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error(err || 'Operation failed');
    }
  };

  const handleDelete = async (subject_id) => {
    try {
      await dispatch(deleteSubject(subject_id)).unwrap();
      message.success('Subject deleted successfully');
    } catch (err) {
      message.error(err || 'Failed to delete subject');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'subject_id',
      key: 'subject_id',
      width: 80,
      render: (id) => <Text code>#{id}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Space>
          <BookOutlined style={{ color: '#6366f1' }} />
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete subject?"
            description="This will remove the subject. Teachers and students using it may need to update their profiles."
            onConfirm={() => handleDelete(record.subject_id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-subjects-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects</h1>
          <Text type="secondary">Manage subjects for teachers and students</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Subject
        </Button>
      </div>

      <div className="filters-section">
        <Search
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="table-container">
        <Table
          dataSource={filteredSubjects}
          columns={columns}
          rowKey="subject_id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </div>

      <Modal
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={editingSubject ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Subject Name"
            rules={[
              { required: true, message: 'Please enter subject name' },
              { min: 2, message: 'Subject name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="e.g. Mathematics" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSubjects;
