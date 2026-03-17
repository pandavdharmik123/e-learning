import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import fileRoutes from './routes/files.js';
import teacherRoutes from './routes/teachers.js';
import studentRoutes from './routes/students.js';
import classRoutes from './routes/classes.js';
import contentRoutes from './routes/content.js';
import adminRoutes from './routes/admin.js';
import documentRoutes from './routes/documents.js';
import paymentRoutes from './routes/payments.js';
import statsRoutes from './routes/stats.js';
import subjectRoutes from './routes/subjects.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/', meRoutes);
app.use('/', fileRoutes);
app.use('/', teacherRoutes);
app.use('/', studentRoutes);
app.use('/', classRoutes);
app.use('/', contentRoutes);
app.use('/', adminRoutes);
app.use('/', documentRoutes);
app.use('/', paymentRoutes);
app.use('/', statsRoutes);
app.use('/', subjectRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});