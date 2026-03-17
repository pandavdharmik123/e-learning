import express from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';
import { z } from 'zod';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};

const CreateSubjectDto = z.object({ name: z.string().min(1).max(191) });
const UpdateSubjectDto = z.object({ name: z.string().min(1).max(191) });

// --- GET all subjects (public - for registration, profile, filters) ---
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ subjects: subjects.map((s) => ({ subject_id: s.subject_id, name: s.name })) });
  } catch (err) {
    if (err.code === 'P2021') {
      // Table does not exist - return empty until migration is run
      console.warn('Subject table not found. Run: mysql -u root -p e_learning < prisma/create_subject_table.sql');
      return res.json({ subjects: [] });
    }
    console.error('Get subjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// --- Admin: Create subject ---
router.post('/admin/subjects', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const parsed = CreateSubjectDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error });
    }
    const { name } = parsed.data;
    const trimmed = name.trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Subject name is required' });
    }
    const existing = await prisma.subject.findFirst({
      where: { name: trimmed },
    });
    if (existing) {
      return res.status(409).json({ error: 'Subject with this name already exists' });
    }
    const subject = await prisma.subject.create({
      data: { name: trimmed },
    });
    res.status(201).json({ subject: { subject_id: subject.subject_id, name: subject.name } });
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// --- Admin: Update subject ---
router.put('/admin/subjects/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = UpdateSubjectDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error });
    }
    const { name } = parsed.data;
    const trimmed = name.trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Subject name is required' });
    }
    const existing = await prisma.subject.findFirst({
      where: { name: trimmed, subject_id: { not: id } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Subject with this name already exists' });
    }
    const subject = await prisma.subject.update({
      where: { subject_id: id },
      data: { name: trimmed },
    });
    res.json({ subject: { subject_id: subject.subject_id, name: subject.name } });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found' });
    }
    console.error('Update subject error:', err);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// --- Admin: Delete subject ---
router.delete('/admin/subjects/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.subject.delete({
      where: { subject_id: id },
    });
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Subject not found' });
    }
    console.error('Delete subject error:', err);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
