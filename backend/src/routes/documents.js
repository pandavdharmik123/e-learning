import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3, s3PublicUrl, getPresignedUrl, extractS3Key } from '../lib/s3.js';
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
      const stamp = Date.now();
      const userId = req.user?.id || 'anon';
      cb(null, `documents/${userId}/${stamp}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const DocumentCreateDto = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().optional(),
  student_ids: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.number()).optional()
  ),
});

const DocumentUpdateDto = z.object({
  title: z.string().min(1),
  subject: z.string().min(1).optional(),
  description: z.string().optional(),
  student_ids: z.preprocess(
    (v) => (typeof v === 'string' ? JSON.parse(v) : v),
    z.array(z.number()).optional()
  ),
});

// --- Create document (teacher only) ---
router.post('/documents', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher only' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const parsed = DocumentCreateDto.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const teacher = await prisma.teacher.findUnique({ where: { teacher_id: req.user.id } });
    if (!teacher) return res.status(400).json({ error: 'Create teacher profile first' });

    const teacherSubjects = Array.isArray(teacher.subjects) ? teacher.subjects : [];
    if (!teacherSubjects.includes(parsed.data.subject)) {
      return res.status(400).json({ error: 'Subject must be one of your teaching subjects' });
    }

    const url = s3PublicUrl(bucket, req.file.key);

    const doc = await prisma.document.create({
      data: {
        teacher_id: req.user.id,
        subject: parsed.data.subject,
        title: parsed.data.title,
        description: parsed.data.description,
        file_url: url,
        file_name: req.file.originalname,
        student_ids: parsed.data.student_ids ?? [],
      },
    });

    res.status(201).json({ document: doc });
  } catch (err) {
    console.error('Create document error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// --- List documents ---
router.get('/documents', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const docs = await prisma.document.findMany({
        where: { teacher_id: req.user.id },
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { reads: true } } },
      });
      return res.json({ documents: docs });
    }

    if (req.user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { student_id: req.user.id },
        select: { subjects_interested: true },
      });
      const studentSubjects = Array.isArray(student?.subjects_interested)
        ? student.subjects_interested
        : [];

      const allDocs = await prisma.document.findMany({
        orderBy: { created_at: 'desc' },
        include: {
          teacher: {
            include: { user: { select: { first_name: true, last_name: true, email: true } } },
          },
        },
      });

      const accessible = allDocs.filter((doc) => {
        if (studentSubjects.length === 0 || !doc.subject || !studentSubjects.includes(doc.subject)) {
          return false;
        }
        const ids = Array.isArray(doc.student_ids) ? doc.student_ids : [];
        if (ids.length > 0) return ids.includes(req.user.id);
        const hired = Array.isArray(doc.teacher?.hired_by_students) ? doc.teacher.hired_by_students : [];
        return hired.includes(req.user.id);
      });

      return res.json({ documents: accessible });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    console.error('List documents error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// --- Get single document ---
router.get('/documents/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const doc = await prisma.document.findUnique({
      where: { document_id: id },
      include: {
        teacher: {
          include: { user: { select: { first_name: true, last_name: true, email: true } } },
        },
        reads: true,
      },
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    if (req.user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { student_id: req.user.id },
        select: { subjects_interested: true },
      });
      const studentSubjects = Array.isArray(student?.subjects_interested) ? student.subjects_interested : [];
      if (studentSubjects.length === 0 || !doc.subject || !studentSubjects.includes(doc.subject)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const ids = Array.isArray(doc.student_ids) ? doc.student_ids : [];
      const hired = Array.isArray(doc.teacher?.hired_by_students) ? doc.teacher.hired_by_students : [];
      const hasAccess = ids.length > 0 ? ids.includes(req.user.id) : hired.includes(req.user.id);
      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });

      await prisma.documentRead.upsert({
        where: { document_id_student_id: { document_id: id, student_id: req.user.id } },
        create: { document_id: id, student_id: req.user.id },
        update: { read_at: new Date() },
      });
    }

    res.json({ document: doc });
  } catch (err) {
    console.error('Get document error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// --- Update document (teacher only) ---
router.put('/documents/:id', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher only' });
    }

    const id = Number(req.params.id);
    const existing = await prisma.document.findUnique({ where: { document_id: id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.teacher_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const parsed = DocumentUpdateDto.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const updateData = {
      title: parsed.data.title,
      description: parsed.data.description,
      student_ids: parsed.data.student_ids ?? existing.student_ids,
    };

    if (parsed.data.subject !== undefined) {
      const teacher = await prisma.teacher.findUnique({ where: { teacher_id: req.user.id } });
      const teacherSubjects = Array.isArray(teacher?.subjects) ? teacher.subjects : [];
      if (!teacherSubjects.includes(parsed.data.subject)) {
        return res.status(400).json({ error: 'Subject must be one of your teaching subjects' });
      }
      updateData.subject = parsed.data.subject;
    }

    if (req.file) {
      updateData.file_url = s3PublicUrl(bucket, req.file.key);
      updateData.file_name = req.file.originalname;
    }

    const doc = await prisma.document.update({
      where: { document_id: id },
      data: updateData,
    });

    res.json({ document: doc });
  } catch (err) {
    console.error('Update document error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// --- Delete document (teacher only) ---
router.delete('/documents/:id', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const doc = await prisma.document.findUnique({ where: { document_id: id } });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'teacher' || doc.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.document.delete({ where: { document_id: id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// --- Get signed URL for viewing/downloading a document ---
router.get('/documents/:id/url', authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const doc = await prisma.document.findUnique({
      where: { document_id: id },
      include: { teacher: true },
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    if (req.user.role === 'teacher' && doc.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.user.role === 'student') {
      const student = await prisma.student.findUnique({
        where: { student_id: req.user.id },
        select: { subjects_interested: true },
      });
      const studentSubjects = Array.isArray(student?.subjects_interested) ? student.subjects_interested : [];
      if (studentSubjects.length === 0 || !doc.subject || !studentSubjects.includes(doc.subject)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const ids = Array.isArray(doc.student_ids) ? doc.student_ids : [];
      const hired = Array.isArray(doc.teacher?.hired_by_students) ? doc.teacher.hired_by_students : [];
      const hasAccess = ids.length > 0 ? ids.includes(req.user.id) : hired.includes(req.user.id);
      if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });

      await prisma.documentRead.upsert({
        where: { document_id_student_id: { document_id: id, student_id: req.user.id } },
        create: { document_id: id, student_id: req.user.id },
        update: { read_at: new Date() },
      });
    }

    const key = extractS3Key(doc.file_url);
    if (!key) {
      return res.status(500).json({ error: 'Could not extract S3 key from file URL' });
    }

    const signedUrl = await getPresignedUrl(bucket, key, 3600);
    res.json({ url: signedUrl });
  } catch (err) {
    console.error('Get document URL error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// --- Get read tracking for a document (teacher only) ---
router.get('/documents/:id/reads', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Teacher only' });
    }

    const id = Number(req.params.id);
    const doc = await prisma.document.findUnique({ where: { document_id: id } });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.teacher_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const reads = await prisma.documentRead.findMany({
      where: { document_id: id },
      orderBy: { read_at: 'desc' },
    });

    const studentIds = reads.map((r) => r.student_id);
    const students = await prisma.user.findMany({
      where: { user_id: { in: studentIds } },
      select: { user_id: true, first_name: true, last_name: true, email: true },
    });

    const studentMap = Object.fromEntries(students.map((s) => [s.user_id, s]));
    const result = reads.map((r) => ({
      ...r,
      student: studentMap[r.student_id] || null,
    }));

    res.json({ reads: result });
  } catch (err) {
    console.error('Get document reads error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
