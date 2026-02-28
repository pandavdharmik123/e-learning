import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Drawer,
  notification,
  Popconfirm,
  Tag,
  Empty,
  Spin,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  FileTextOutlined,
  DownloadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  createDocument,
  fetchDocuments,
  updateDocument,
  deleteDocument,
  fetchDocumentReads,
  clearReads,
  getDocumentSignedUrl,
} from '@store/documentSlice';
import { fetchTeacherStudents } from '@store/teacherSlice';
import './documents.scss';

const { Dragger } = Upload;

const Documents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { documents, reads, loading } = useSelector((state) => state.documents);
  const { students } = useSelector((state) => state.teachers);

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    dispatch(fetchDocuments());
    if (isTeacher) {
      dispatch(fetchTeacherStudents());
    }
  }, [user?.role]);

  const openCreateModal = () => {
    setEditingDoc(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    form.setFieldsValue({
      title: doc.title,
      description: doc.description,
      student_ids: Array.isArray(doc.student_ids) ? doc.student_ids : [],
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('title', values.title);
      if (values.description) formData.append('description', values.description);
      if (values.student_ids?.length) {
        formData.append('student_ids', JSON.stringify(values.student_ids));
      }
      if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj || fileList[0]);
      }

      if (editingDoc) {
        await dispatch(updateDocument({ id: editingDoc.document_id, formData })).unwrap();
        notification.success({ message: 'Document updated successfully' });
      } else {
        if (fileList.length === 0) {
          notification.error({ message: 'Please upload a file' });
          return;
        }
        await dispatch(createDocument(formData)).unwrap();
        notification.success({ message: 'Document created successfully' });
      }
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
      setEditingDoc(null);
    } catch (err) {
      notification.error({ message: err || 'Something went wrong' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteDocument(id)).unwrap();
      notification.success({ message: 'Document deleted successfully' });
    } catch (err) {
      notification.error({ message: err || 'Failed to delete document' });
    }
  };

  const openReadTracker = (doc) => {
    dispatch(fetchDocumentReads(doc.document_id));
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    dispatch(clearReads());
  };

  const handleViewDocument = async (doc) => {
    try {
      const signedUrl = await getDocumentSignedUrl(doc.document_id);
      window.open(signedUrl, '_blank');
    } catch (err) {
      notification.error({ message: 'Failed to get document URL' });
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatDateTime = (dateStr) =>
    new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const teacherColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="doc-title-cell">
          <FileTextOutlined className="doc-icon" />
          <div>
            <div className="doc-title">{text}</div>
            <div className="doc-filename">{record.file_name}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Access',
      key: 'access',
      width: 140,
      render: (_, record) => {
        const ids = Array.isArray(record.student_ids) ? record.student_ids : [];
        return ids.length > 0 ? (
          <Tag color="blue">{ids.length} students</Tag>
        ) : (
          <Tag color="green">All hired</Tag>
        );
      },
    },
    {
      title: 'Reads',
      key: 'reads',
      width: 80,
      render: (_, record) => (
        <Tooltip title="View who read this">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => openReadTracker(record)}
          >
            {record._count?.reads ?? 0}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'Uploaded',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (date) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="View/Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleViewDocument(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this document?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.document_id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const studentColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="doc-title-cell">
          <FileTextOutlined className="doc-icon" />
          <div>
            <div className="doc-title">{text}</div>
            <div className="doc-filename">{record.file_name}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Teacher',
      key: 'teacher',
      width: 180,
      render: (_, record) => {
        const t = record.teacher?.user;
        return t ? `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email : '-';
      },
    },
    {
      title: 'Uploaded',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (date) => formatDate(date),
    },
    {
      title: 'Download',
      key: 'download',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => handleViewDocument(record)}
        >
          Open
        </Button>
      ),
    },
  ];

  const readColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => {
        const s = record.student;
        return s
          ? `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email
          : `Student #${record.student_id}`;
      },
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => record.student?.email || '-',
    },
    {
      title: 'Read At',
      dataIndex: 'read_at',
      key: 'read_at',
      render: (date) => formatDateTime(date),
    },
  ];

  const uploadProps = {
    beforeUpload: () => false,
    fileList,
    onChange: ({ fileList: newList }) => setFileList(newList.slice(-1)),
    maxCount: 1,
  };

  const studentOptions = (students || []).map((s) => ({
    label:
      `${s.user?.first_name || ''} ${s.user?.last_name || ''}`.trim() ||
      s.user?.email ||
      `Student #${s.student_id}`,
    value: s.student_id,
  }));

  return (
    <div className="documents-page">
      <div className="documents-header">
        <p className="page-title">Documents</p>
        {isTeacher && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="create-button"
            onClick={openCreateModal}
          >
            Create Document
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        <Table
          dataSource={documents}
          columns={isTeacher ? teacherColumns : studentColumns}
          rowKey="document_id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty description={isTeacher ? 'No documents yet. Create your first one!' : 'No documents available.'} />
            ),
          }}
        />
      </Spin>

      {/* Create / Edit Modal */}
      <Modal
        title={editingDoc ? 'Edit Document' : 'Create Document'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingDoc(null);
          form.resetFields();
          setFileList([]);
        }}
        onOk={handleSubmit}
        okText={editingDoc ? 'Update' : 'Create'}
        confirmLoading={loading}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" className="document-form">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Document title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>

          <Form.Item name="student_ids" label="Visible To">
            <Select
              mode="multiple"
              placeholder="Leave empty for all hired students"
              options={studentOptions}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="File"
            required={!editingDoc}
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to upload</p>
              <p className="ant-upload-hint">
                {editingDoc ? 'Upload a new file to replace the existing one' : 'Max 50MB'}
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Read Tracking Drawer */}
      <Drawer
        title="Read Tracking"
        placement="right"
        width={480}
        onClose={closeDrawer}
        open={isDrawerOpen}
      >
        <Table
          dataSource={reads}
          columns={readColumns}
          rowKey="id"
          pagination={false}
          loading={loading}
          locale={{
            emptyText: <Empty description="No one has read this document yet" />,
          }}
        />
      </Drawer>
    </div>
  );
};

export default Documents;
