import React, { useEffect, useState } from 'react';
import { Modal, Button, Spin, message, Typography } from 'antd';
import { WalletOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { createPaymentOrder, verifyPayment, clearOrder } from '@store/paymentSlice';
import { hireTeacher } from '@store/studentSlice';

const { Text, Title } = Typography;

const PaymentModal = ({ visible, onCancel, teacher, onSuccess }) => {
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      dispatch(clearOrder());
      return;
    }
    if (teacher && !order) {
      const amount = teacher.monthly_rate
        ? Number(teacher.monthly_rate)
        : (Number(teacher.hourly_rate) || 0) * 30;
      if (amount > 0) {
        dispatch(createPaymentOrder({
          teacherId: teacher.teacher_id,
          amount,
        }));
      }
    }
  }, [visible, teacher]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handlePayment = () => {
    if (!order || !razorpayLoaded) {
      message.warning('Payment gateway is loading. Please wait...');
      return;
    }

    const amountPaise = Math.round(Number(order.amount) * 100);
    if (amountPaise <= 0) {
      message.error('Invalid payment amount. Please try again.');
      return;
    }

    const payerName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Student';
    const payerEmail = (user?.email || '').trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail);

    if (!isValidEmail || !payerEmail) {
      message.error('Please add a valid email to your profile before making a payment.');
      return;
    }

    const options = {
      key: order.razorpayKey,
      amount: amountPaise,
      currency: order.currency || 'INR',
      order_id: order.orderId,
      name: 'E-Learning Platform',
      description: `Hire ${teacher?.user?.first_name} ${teacher?.user?.last_name}`,
      prefill: {
        name: payerName,
        email: payerEmail,
      },
      handler: async function (response) {
        try {
          const result = await dispatch(
            verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              teacherId: teacher.teacher_id,
              payment_method: response.razorpay_payment_id ? 'razorpay' : null,
            })
          ).unwrap();

          if (result.success) {
            // Refresh hired teachers list
            await dispatch(hireTeacher(teacher.teacher_id));
            message.success(result.message || 'Payment successful! Teacher hired.');
            dispatch(clearOrder());
            onSuccess?.();
            onCancel();
          }
        } catch (err) {
          message.error(err || 'Payment verification failed');
        }
      },
      theme: {
        color: '#6366f1',
      },
      modal: {
        ondismiss: () => {
          message.info('Payment cancelled');
          dispatch(clearOrder());
        },
      },
    };

    console.log(options);

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response) {
      message.error(`Payment failed: ${response.error.description || 'Please try again'}`);
    });
    razorpay.open();
  };

  const amount = teacher
    ? teacher.monthly_rate
      ? Number(teacher.monthly_rate)
      : (Number(teacher.hourly_rate) || 0) * 30
    : 0;

  return (
    <Modal
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <WalletOutlined style={{ color: '#6366f1' }} />
        <span>Complete Payment</span>
      </div>
    }
      open={visible}
      onCancel={() => {
        dispatch(clearOrder());
        onCancel?.();
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="pay"
          type="primary"
          loading={loading || !razorpayLoaded}
          onClick={handlePayment}
          disabled={!order || !razorpayLoaded}
          icon={<WalletOutlined />}
        >
          Pay ₹{amount.toFixed(2)}
        </Button>,
      ]}
      width={500}
    >
      {loading && !order ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Creating payment order...</Text>
          </div>
        </div>
      ) : order ? (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Title level={5}>Teacher Details</Title>
            <Text>
              <strong>{teacher?.user?.first_name} {teacher?.user?.last_name}</strong>
            </Text>
            <br />
            <Text type="secondary">{teacher?.qualifications}</Text>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text>Amount:</Text>
              <Text strong style={{ fontSize: '18px' }}>
                ₹{amount.toFixed(2)}
              </Text>
            </div>
            {teacher?.monthly_rate ? (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Monthly subscription
              </Text>
            ) : (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Monthly amount
              </Text>
            )}
          </div>

          <div style={{ padding: '12px', background: '#eef2ff', borderRadius: '8px', marginBottom: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CheckCircleOutlined style={{ color: '#6366f1', marginRight: '4px' }} />
              Secure payment powered by Razorpay
            </Text>
          </div>

          {error && (
            <div style={{ padding: '12px', background: '#fee', borderRadius: '8px', marginTop: '16px' }}>
              <Text type="danger">{error}</Text>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="danger">Failed to create payment order</Text>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
