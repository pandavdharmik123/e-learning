import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3, s3PublicUrl } from '../lib/s3.js';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth.js';

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
      cb(null, `uploads/${userId}/${stamp}-${file.fieldname}.${ext}`);
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 }
});

router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  const key = req.file.key;
  const url = s3PublicUrl(bucket, key);

  const user = await prisma.user.update({
    where: { user_id: req.user.id },
    data: { profile_picture: url }
  });

  res.json({ profile_picture: user.profile_picture });
});

router.post('/files', authMiddleware, upload.single('file'), async (req, res) => {
  const { key, size, mimetype } = req.file;
  const url = s3PublicUrl(bucket, key);

  const file = await prisma.file.create({
    data: {
      ownerId: req.user.id,
      key, url,
      size: size ? Number(size) : null,
      mimeType: mimetype || null
    }
  });

  res.json({ file });
});

router.get('/files', authMiddleware, async (req, res) => {
  const files = await prisma.file.findMany({
    where: { ownerId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ files });
});

export default router;