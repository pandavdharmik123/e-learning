import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';

const router = express.Router();

// --- Get Public Statistics (for home page) ---
router.get('/stats/public', async (req, res) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalPayments,
      successfulPayments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'student', is_deleted: false } }),
      prisma.user.count({ where: { role: 'teacher', is_deleted: false } }),
      prisma.class.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
    ]);

    // Count unique subjects from teachers
    const teachers = await prisma.teacher.findMany({
      select: { subjects: true },
    });
    
    const allSubjects = new Set();
    teachers.forEach((teacher) => {
      if (teacher.subjects && Array.isArray(teacher.subjects)) {
        teacher.subjects.forEach((subject) => allSubjects.add(subject));
      }
    });
    const totalSubjects = allSubjects.size || totalClasses; // Fallback to classes count if no subjects

    // Calculate success rate
    const successRate = totalPayments > 0 
      ? Math.round((successfulPayments / totalPayments) * 100)
      : 0;

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalSubjects,
        successRate,
      },
    });
  } catch (err) {
    console.error('Get public stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// --- Get Dashboard Statistics ---
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'admin') {
      // Admin stats: total users, teachers, students, classes, documents, payments
      const [
        totalUsers,
        totalTeachers,
        totalStudents,
        totalClasses,
        totalPayments,
        successfulPayments,
      ] = await Promise.all([
        prisma.user.count({ where: { is_deleted: false } }),
        prisma.user.count({ where: { role: 'teacher', is_deleted: false } }),
        prisma.user.count({ where: { role: 'student', is_deleted: false } }),
        prisma.class.count(),
        prisma.payment.count(),
        prisma.payment.count({ where: { status: 'SUCCESS' } }),
      ]);

      // Try to count documents, but handle if table doesn't exist
      let totalDocuments = 0;
      try {
        totalDocuments = await prisma.document.count();
      } catch (err) {
        console.warn('Document table not found, skipping document count');
      }

      const totalRevenue = await prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      });

      stats = {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalClasses,
        totalDocuments,
        totalPayments,
        successfulPayments,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
      };
    } else if (userRole === 'teacher') {
      // Teacher stats: students, classes, documents
      const teacher = await prisma.teacher.findUnique({
        where: { teacher_id: userId },
        select: { hired_by_students: true },
      });

      const studentCount = teacher?.hired_by_students?.length || 0;

      const totalClasses = await prisma.class.count({ where: { teacher_id: userId } });
      
      // Try to count documents, but handle if table doesn't exist
      let totalDocuments = 0;
      try {
        totalDocuments = await prisma.document.count({ where: { teacher_id: userId } });
      } catch (err) {
        console.warn('Document table not found, skipping document count');
      }

      stats = {
        totalStudents: studentCount,
        totalClasses,
        totalDocuments,
      };
    } else if (userRole === 'student') {
      // Student stats: hired teachers, classes, documents accessible
      const student = await prisma.student.findUnique({
        where: { student_id: userId },
      });

      // Count hired teachers
      const allTeachers = await prisma.teacher.findMany({
        select: { hired_by_students: true },
      });
      const hiredTeachers = allTeachers.filter((teacher) => {
        const hired = Array.isArray(teacher.hired_by_students) ? teacher.hired_by_students : [];
        return hired.includes(userId);
      });
      const hiredTeachersCount = hiredTeachers.length;

      // Count classes student is enrolled in
      const allClasses = await prisma.class.findMany();
      const enrolledClasses = allClasses.filter((cls) => {
        const studentIds = Array.isArray(cls.student_ids) ? cls.student_ids : [];
        return studentIds.includes(userId);
      });

      // Count accessible documents
      let accessibleDocs = [];
      try {
        const allDocs = await prisma.document.findMany({
          include: { teacher: { select: { hired_by_students: true } } },
        });
        accessibleDocs = allDocs.filter((doc) => {
          const ids = Array.isArray(doc.student_ids) ? doc.student_ids : [];
          if (ids.length > 0) return ids.includes(userId);
          const hired = Array.isArray(doc.teacher?.hired_by_students)
            ? doc.teacher.hired_by_students
            : [];
          return hired.includes(userId);
        });
      } catch (err) {
        console.warn('Document table not found, skipping document count');
      }

      // Count payments
      const [totalPayments, successfulPayments] = await Promise.all([
        prisma.payment.count({ where: { user_id: userId } }),
        prisma.payment.count({
          where: { user_id: userId, status: 'SUCCESS' },
        }),
      ]);

      const totalSpent = await prisma.payment.aggregate({
        where: { user_id: userId, status: 'SUCCESS' },
        _sum: { amount: true },
      });

      stats = {
        hiredTeachers: hiredTeachersCount,
        totalClasses: enrolledClasses.length,
        totalDocuments: accessibleDocs.length,
        totalPayments,
        successfulPayments,
        totalSpent: Number(totalSpent._sum.amount || 0),
      };
    }

    res.json({ stats });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
