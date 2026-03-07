import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Input,
  Select,
  Spin,
  Empty,
  Card,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentHistory } from '@store/paymentSlice';
import './userPayments.scss';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const UserPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filteredPayments, setFilteredPayments] = useState([]);

  const dispatch = useDispatch();
  const { paymentHistory, loading } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  useEffect(() => {
    let filtered = paymentHistory || [];

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.teacher?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.razorpay_order_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [searchTerm, statusFilter, paymentHistory]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      SUCCESS: { color: 'success', icon: <CheckCircleOutlined />, text: 'Success' },
      FAILED: { color: 'error', icon: <CloseCircleOutlined />, text: 'Failed' },
      PENDING: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Pending' },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: 'payment_id',
      key: 'payment_id',
      width: 100,
      render: (id) => <Text code>#{id}</Text>,
    },
    {
      title: 'Teacher',
      key: 'teacher',
      width: 250,
      render: (_, record) => (
        <div className="teacher-cell">
          <UserOutlined className="teacher-icon" />
          <div>
            <div style={{ fontWeight: 500 }}>{record.teacher?.name || 'N/A'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.teacher?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <div>
          <Text strong style={{ fontSize: '16px' }}>
            ₹{Number(amount).toFixed(2)}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.currency}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 120,
      render: (method) => (
        <Tag>{method || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Order ID',
      dataIndex: 'razorpay_order_id',
      key: 'razorpay_order_id',
      width: 200,
      render: (id) => (
        <Text code copyable style={{ fontSize: '11px' }}>
          {id}
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDate(date),
    },
  ];

  const successfulPayments = filteredPayments.filter((p) => p.status === 'SUCCESS');
  const totalSpent = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="user-payments-page">
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">My Payments</Title>
          <Text type="secondary">View your payment history</Text>
        </div>
      </div>

      <div className="summary-cards">
        <Card className="summary-card">
          <DollarOutlined className="summary-icon" />
          <div className="summary-content">
            <div className="summary-value">₹{totalSpent.toFixed(2)}</div>
            <div className="summary-label">Total Spent</div>
          </div>
        </Card>
        <Card className="summary-card">
          <CheckCircleOutlined className="summary-icon success" />
          <div className="summary-content">
            <div className="summary-value">{successfulPayments.length}</div>
            <div className="summary-label">Successful Payments</div>
          </div>
        </Card>
        <Card className="summary-card">
          <ClockCircleOutlined className="summary-icon warning" />
          <div className="summary-content">
            <div className="summary-value">
              {filteredPayments.filter((p) => p.status === 'PENDING').length}
            </div>
            <div className="summary-label">Pending</div>
          </div>
        </Card>
      </div>

      <div className="filters-section">
        <Search
          placeholder="Search by teacher name or order ID..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          className="filter-select"
          style={{ width: 150 }}
        >
          <Option value="ALL">All Status</Option>
          <Option value="SUCCESS">Success</Option>
          <Option value="FAILED">Failed</Option>
          <Option value="PENDING">Pending</Option>
        </Select>
      </div>

      <div className="table-container">
        <Spin spinning={loading}>
          <Table
            dataSource={filteredPayments}
            columns={columns}
            rowKey="payment_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: <Empty description="No payment history found" />,
            }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default UserPayments;
