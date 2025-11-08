
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';
import { z } from 'zod';

const router = express.Router();

export function requireStudent(req, res, next) {
  if (req.user?.role === 'student' || req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Student or admin only' });
}

const StudentDto = z.object({
  grade_level: z.string().optional(),
  subjects_interested: z.array(z.string()).optional(),
  learning_goals: z.string().optional(),
  parent_contact: z.string().optional()
});

router.post('/student/me', authMiddleware, requireStudent, async (req, res) => {
  const parsed = StudentDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const s = await prisma.student.upsert({
    where: { student_id: req.user.id },
    update: { 
      grade_level: parsed.data.grade_level,
      subjects_interested: parsed.data.subjects_interested,
      learning_goals: parsed.data.learning_goals,
      parent_contact: parsed.data.parent_contact
    },
    create: {
      student_id: req.user.id,
      grade_level: parsed.data.grade_level,
      subjects_interested: parsed.data.subjects_interested,
      learning_goals: parsed.data.learning_goals,
      parent_contact: parsed.data.parent_contact
    }
  });
  res.json({ student: s });
});

router.get('/student/me', authMiddleware, requireStudent, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { student_id: req.user.id },
      include: {
        user: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }


    const { user, ...studentDetails } = student;

    if(user.password_hash) {
      delete user.password_hash;
    }

    res.status(200)
      .json({
      profile: {
        user,
        student: studentDetails
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.post("/teachers/:teacherId/hire", authMiddleware, requireStudent, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const studentId = req.user.id;


    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: Number(teacherId) },
    });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const updateData = teacher.hired_by_students || [];
    if(!updateData.includes(studentId)) {
      updateData.push(studentId);
    } else {
        return res.status(409).json({ teacher, message: "Teacher already hired by you!" });
    }

    await prisma.teacher.update({
      where: { teacher_id: Number(teacherId) },
      data: {
        hired_by_students: updateData,
        total_students: { increment: 1 },
      },
    });

    res.json({ teacher, message: "Teacher hired successfully!" });
  } catch (err) {
    console.error("Hire teacher error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/student/me/teachers", authMiddleware, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;

    const teachers = await prisma.teacher.findMany({
      where: {
        hired_by_students: { array_contains: studentId },
      },
      include: {
        user: { select: { first_name: true, last_name: true, profile_picture: true } },
      },
    });

    res.json({ teachers });
  } catch (err) {
    console.error("Fetch hired teachers error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});



export default router;
