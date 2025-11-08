
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3, s3PublicUrl } from '../lib/s3.js';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';
import { z } from 'zod';

const router = express.Router();
const bucket = process.env.S3_BUCKET;

const upload = multer({
  storage: multerS3({
    s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
    key: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      const stamp = Date.now();
      const userId = req.user?.id || 'anon';
      cb(null, `content/${userId}/${stamp}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const ContentDto = z.object({
  title: z.string(),
  description: z.string().optional(),
  content_type: z.enum(['book', 'note', 'assignment']),
  access_level: z.enum(['all_students', 'specific_enrollment'])
});

router.post('/content', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Teacher or admin only' });
  }
  const parsed = ContentDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const teacher = await prisma.teacher.findUnique({ where: { teacher_id: req.user.id }});
  if (!teacher) return res.status(400).json({ error: 'Create teacher profile first' });

  const key = req.file.key;
  const url = s3PublicUrl(bucket, key);

  const c = await prisma.content.create({
    data: {
      teacher_id: req.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      file_url: url,
      content_type: parsed.data.content_type,
      access_level: parsed.data.access_level
    }
  });
  res.status(201).json({ content: c });
});

router.get('/content', async (req, res) => {
  const { teacher_id } = req.query;
  const where = {};
  if (teacher_id) where.teacher_id = Number(teacher_id);
  const list = await prisma.content.findMany({ where, orderBy: { upload_date: 'desc' } });
  res.json({ content: list });
});

router.delete('/content/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const c = await prisma.content.findUnique({ where: { content_id: id }});
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && req.user.id !== c.teacher_id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await prisma.content.delete({ where: { content_id: id } });
  res.json({ ok: true });
});

export default router;
