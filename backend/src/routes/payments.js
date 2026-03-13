import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';
import { z } from 'zod';

const router = express.Router();

// Initialize Razorpay
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.warn('⚠️  Razorpay credentials not found in environment variables');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Middleware
const requireStudent = (req, res, next) => {
  if (req.user?.role === 'student' || req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Student or admin only' });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};

const requireTeacher = (req, res, next) => {
  if (req.user?.role === 'teacher' || req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Teacher or admin only' });
};

// Validation schemas
const CreateOrderDto = z.object({
  teacherId: z.number().int().positive(),
  amount: z.number().positive(),
});

const VerifyPaymentDto = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  teacherId: z.number().int().positive(),
});

// --- Create Payment Order ---
router.post('/payment/create-order', authMiddleware, requireStudent, async (req, res) => {
  try {
    const parsed = CreateOrderDto.safeParse({
      teacherId: Number(req.body.teacherId),
      amount: Number(req.body.amount),
    });

    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error });
    }

    const { teacherId, amount } = parsed.data;
    const userId = req.user.id;

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: teacherId },
      include: { user: { select: { first_name: true, last_name: true } } },
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if already hired
    const hiredStudents = teacher.hired_by_students || [];
    if (hiredStudents.includes(userId)) {
      return res.status(409).json({ error: 'Teacher already hired by you' });
    }

    // Check for existing pending payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        user_id: userId,
        teacher_id: teacherId,
        status: 'PENDING',
      },
      orderBy: { created_at: 'desc' },
    });

    if (existingPayment) {
      return res.json({
        orderId: existingPayment.razorpay_order_id,
        amount: Number(existingPayment.amount),
        currency: existingPayment.currency,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Validate Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      return res.status(500).json({ 
        error: 'Payment gateway not configured. Please contact administrator.' 
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `hire_${teacherId}_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        teacherId: teacherId.toString(),
        teacherName: `${teacher.user.first_name} ${teacher.user.last_name}`,
      },
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (razorpayError) {
      console.error('Razorpay API Error:', razorpayError);
      if (razorpayError.statusCode === 401) {
        return res.status(500).json({ 
          error: 'Invalid Razorpay credentials. Please check your API keys.',
          details: 'Authentication failed with Razorpay. Verify RAZORPAY_KEY_ID and RAZORPAY_SECRET in .env file.'
        });
      }
      throw razorpayError;
    }

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        user_id: userId,
        teacher_id: teacherId,
        razorpay_order_id: razorpayOrder.id,
        amount: amount,
        currency: 'INR',
        status: 'PENDING',
      },
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// --- Verify Payment ---
router.post('/payment/verify', authMiddleware, requireStudent, async (req, res) => {
  try {
    const parsed = VerifyPaymentDto.safeParse({
      razorpay_order_id: req.body.razorpay_order_id,
      razorpay_payment_id: req.body.razorpay_payment_id,
      razorpay_signature: req.body.razorpay_signature,
      teacherId: Number(req.body.teacherId),
    });

    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, teacherId } = parsed.data;
    const userId = req.user.id;

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpay_order_id },
      include: {
        teacher: true,
        user: { select: { user_id: true, email: true } },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment order not found' });
    }

    // Verify ownership
    if (payment.user_id !== userId || payment.teacher_id !== teacherId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Update payment status to FAILED
      await prisma.payment.update({
        where: { payment_id: payment.payment_id },
        data: {
          status: 'FAILED',
          razorpay_payment_id,
        },
      });

      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment status to SUCCESS
    await prisma.payment.update({
      where: { payment_id: payment.payment_id },
      data: {
        status: 'SUCCESS',
        razorpay_payment_id,
        payment_method: req.body.payment_method || null,
      },
    });

    // Hire the teacher
    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: teacherId },
    });

    const updateData = teacher.hired_by_students || [];
    if (!updateData.includes(userId)) {
      updateData.push(userId);

      await prisma.teacher.update({
        where: { teacher_id: teacherId },
        data: {
          hired_by_students: updateData,
          total_students: { increment: 1 },
        },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and teacher hired successfully!',
      payment: {
        payment_id: payment.payment_id,
        amount: Number(payment.amount),
        status: 'SUCCESS',
      },
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// --- Get User Payment History ---
router.get('/payments/my', authMiddleware, requireStudent, async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { user_id: userId },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                profile_picture: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      payments: payments.map((p) => ({
        payment_id: p.payment_id,
        teacher: {
          teacher_id: p.teacher.teacher_id,
          name: `${p.teacher.user.first_name} ${p.teacher.user.last_name}`,
          email: p.teacher.user.email,
        },
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        payment_method: p.payment_method,
        razorpay_order_id: p.razorpay_order_id,
        razorpay_payment_id: p.razorpay_payment_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
    });
  } catch (err) {
    console.error('Get payment history error:', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// --- Admin: Get All Payments ---
router.get('/admin/payments', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      payments: payments.map((p) => ({
        payment_id: p.payment_id,
        user: {
          user_id: p.user.user_id,
          name: `${p.user.first_name} ${p.user.last_name}`,
          email: p.user.email,
        },
        teacher: {
          teacher_id: p.teacher.teacher_id,
          name: `${p.teacher.user.first_name} ${p.teacher.user.last_name}`,
          email: p.teacher.user.email,
        },
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        payment_method: p.payment_method,
        razorpay_order_id: p.razorpay_order_id,
        razorpay_payment_id: p.razorpay_payment_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
    });
  } catch (err) {
    console.error('Get all payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// --- Teacher: Get My Payments (Earnings) ---
router.get('/teacher/payments', authMiddleware, requireTeacher, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { teacher_id: teacherId },
      include: {
        user: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            profile_picture: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Calculate earnings summary
    const successfulPayments = payments.filter(p => p.status === 'SUCCESS');
    const totalEarnings = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const failedPayments = payments.filter(p => p.status === 'FAILED');

    res.json({
      payments: payments.map((p) => ({
        payment_id: p.payment_id,
        student: {
          user_id: p.user.user_id,
          name: `${p.user.first_name} ${p.user.last_name}`,
          email: p.user.email,
          profile_picture: p.user.profile_picture,
        },
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        payment_method: p.payment_method,
        razorpay_order_id: p.razorpay_order_id,
        razorpay_payment_id: p.razorpay_payment_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
      summary: {
        totalEarnings: Number(totalEarnings.toFixed(2)),
        totalPayments: payments.length,
        successfulPayments: successfulPayments.length,
        pendingPayments: pendingPayments.length,
        failedPayments: failedPayments.length,
      },
    });
  } catch (err) {
    console.error('Get teacher payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

export default router;
