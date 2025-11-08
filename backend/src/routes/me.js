import express from 'express';
import { authMiddleware } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { user_id: req.user.id },
    select: { user_id: true, email: true, role: true, first_name: true, last_name: true, phone_number: true, profile_picture: true, is_verified: true, created_at: true, updated_at: true }
  });
  res.json({ profile: { user: me } });
});

export default router;