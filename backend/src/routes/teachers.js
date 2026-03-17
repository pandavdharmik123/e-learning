
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';
import { z } from 'zod';

const router = express.Router();


export function requireTeacher(req, res, next) {
  if (req.user?.role === 'teacher' || req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Teacher or admin only' });
}

const TeacherDto = z.object({
  subjects: z.array(z.string()).optional(),
  qualifications: z.string().optional(),
  university: z.string().optional(),
  experience_years: z.number().int().nonnegative().optional(),
  hourly_rate: z.number().nonnegative().optional(),
  monthly_rate: z.number().nonnegative().optional(),
  bio: z.string().optional(),
  is_approved: z.boolean().optional()
});


router.post('/teacher/me', authMiddleware, requireTeacher, async (req, res) => {
  const parsed = TeacherDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);


  const t = await prisma.teacher.upsert({
    where: { teacher_id: req.user.id },
    update: { 
      subjects: parsed.data.subjects ?? undefined,
      qualifications: parsed.data.qualifications,
      university: parsed.data.university,
      experience_years: parsed.data.experience_years,
      hourly_rate: parsed.data.hourly_rate,
      monthly_rate: parsed.data.monthly_rate,
      bio: parsed.data.bio,
      is_approved: parsed.data.is_approved
    },
    create: {
      teacher_id: req.user.id,
      subjects: parsed.data.subjects ?? undefined,
      qualifications: parsed.data.qualifications,
      university: parsed.data.university,
      experience_years: parsed.data.experience_years,
      hourly_rate: parsed.data.hourly_rate,
      monthly_rate: parsed.data.monthly_rate,
      bio: parsed.data.bio,
      is_approved: parsed.data.is_approved ?? false
    }
  });
  res.json({ teacher: t });
});


router.get('/teacher/me', authMiddleware, requireTeacher, async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { teacher_id: req.user.id },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { user, ...teacherDetails } = teacher;

    res.json({
      profile: {
        user,
        teacher: teacherDetails
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.get('/teacher/all', async (req, res) => {
  const list = await prisma.teacher.findMany({
    include: { user: { select: { first_name: true, last_name: true, profile_picture: true, user_id: true } } },
    orderBy: { teacher_id: 'asc' }
  });
  res.json({ teachers: list });
});

router.get("/teacher/me/students", authMiddleware, requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;

        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: teacherId },
            select: { hired_by_students: true },
        });

        if (!teacher) return res.status(404).json({ error: "Teacher not found" });

        const students = await prisma.student.findMany({
            where: {
                student_id: { in: teacher.hired_by_students || [] },
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        profile_picture: true,
                        phone_number: true,
                        email: true,
                        created_at: true
                    }
                },
            },
        });

        res.json({ students });
    } catch (err) {
        console.error("Fetch students for teacher error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;
