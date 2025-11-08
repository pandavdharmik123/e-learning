import express from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import {authMiddleware, signToken} from '../lib/auth.js';

const router = express.Router();

const RegisterDto = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['admin', 'teacher', 'student']),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone_number: z.string().optional(),

    subjects: z.array(z.string()).optional(),
    language: z.array(z.string()).optional(),
    qualifications: z.string().optional(),
    experience_years: z.number().optional(),
    hourly_rate: z.number().optional(),
    monthly_rate: z.number().optional(),
    bio: z.string().optional(),

    grade_level: z.string().optional(),
    parent_contact: z.string().optional(),
    subjects_interested: z.array(z.string()).optional(),
    learning_goals: z.string().optional()
});

router.post('/register', async (req, res) => {
    try {
        const parse = RegisterDto.safeParse(req.body);
        if (!parse.success) return res.status(400).json(parse.error);

        const {
            email,
            password,
            role,
            first_name,
            last_name,
            phone_number,
            subjects,
            language,
            qualifications,
            experience_years,
            hourly_rate,
            monthly_rate,
            bio,
            grade_level,
            subjects_interested,
            learning_goals,
            parent_contact,
        } = parse.data;

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(409).json({ error: 'Email already in use' });

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password_hash,
                role,
                first_name,
                last_name,
                phone_number,
            },
        });

        if (role === 'teacher') {
            await prisma.teacher.create({
                data: {
                    teacher_id: user.user_id,
                    subjects: subjects ?? [],
                    language: language ?? [],
                    qualifications,
                    experience_years,
                    hourly_rate,
                    monthly_rate,
                    bio,
                },
            });
        }

        if (role === 'student') {
          await prisma.student.create({
            data: {
              student_id: user.user_id,
              grade_level,
              subjects_interested,
              learning_goals,
              parent_contact,
            },
          });
        }

        const token = signToken({
            id: user.user_id,
            email: user.email,
            role: user.role,
        });

        res.json({ token, user });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            phone_number,
            subjects,
            language,
            qualifications,
            experience_years,
            hourly_rate,
            monthly_rate,
            bio,
            grade_level,
            subjects_interested,
            learning_goals,
            parent_contact,
        } = req.body;

        await prisma.user.update({
            where: { user_id: req.user.id },
            data: {
                first_name,
                last_name,
                phone_number,
                updated_at: new Date(),
            },
        });

        if (req.user.role === 'teacher') {
            await prisma.teacher.update({
                where: { teacher_id: req.user.id },
                data: {
                    subjects: subjects ?? undefined,
                    language: language ?? undefined,
                    qualifications,
                    experience_years,
                    hourly_rate,
                    monthly_rate,
                    bio,
                },
            });
        }

        if (req.user.role === 'student') {
            await prisma.student.update({
                where: { student_id: req.user.id },
                data: {
                    grade_level,
                    subjects_interested,
                    learning_goals,
                    parent_contact,
                },
            });
        }

        const profile = await prisma.user.findUnique({
            where: { user_id: req.user.id },
            include: {
                teacher: true,
                student: true,
            },
        });

        res.json({ user: profile });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/login', async (req, res) => {
  const parse = LoginDto.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error);

  const { email, password } = parse.data;

  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  if(user.role !== 'admin' && !user.is_verified) return res.status(401).json({ error: 'User is not verified! Please wait until admin verification!' });

  const token = signToken({ id: user.user_id, email: user.email, role: user.role });
    res.json({ token, user });
});

export default router;