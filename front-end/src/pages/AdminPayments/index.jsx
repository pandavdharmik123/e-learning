import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Input,
  Select,
  Spin,
  Empty,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPayments } from '@store/adminSlice';
import './adminPayments.scss';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filteredPayments, setFilteredPayments] = useState([]);

  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAllPayments());
  }, [dispatch]);

  useEffect(() => {
    let filtered = payments || [];

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.razorpay_order_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [searchTerm, statusFilter, payments]);

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
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user?.name || 'N/A'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user?.email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Teacher',
      key: 'teacher',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.teacher?.name || 'N/A'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.teacher?.email}
          </Text>
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

  return (
    <div className="admin-payments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Logs</h1>
          <Text type="secondary">View all payment transactions</Text>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <WalletOutlined className="stat-icon" />
            <div>
              <div className="stat-value">
                ₹{filteredPayments
                  .filter((p) => p.status === 'SUCCESS')
                  .reduce((sum, p) => sum + Number(p.amount), 0)
                  .toFixed(2)}
              </div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircleOutlined className="stat-icon success" />
            <div>
              <div className="stat-value">
                {filteredPayments.filter((p) => p.status === 'SUCCESS').length}
              </div>
              <div className="stat-label">Successful</div>
            </div>
          </div>
          <div className="stat-card">
            <CloseCircleOutlined className="stat-icon error" />
            <div>
              <div className="stat-value">
                {filteredPayments.filter((p) => p.status === 'FAILED').length}
              </div>
              <div className="stat-label">Failed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <Search
          placeholder="Search by user, teacher, or order ID..."
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
            scroll={{ x: 1200 }}
            locale={{
              emptyText: <Empty description="No payments found" />,
            }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default AdminPayments;
