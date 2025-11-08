import express from "express";
import { prisma } from "../lib/prisma.js";
import {authMiddleware} from "../lib/auth.js";
import {requireTeacher} from "./teachers.js";
import {requireStudent} from "./students.js";

const router = express.Router();

router.post("/class/create", authMiddleware, requireTeacher, async (req, res) => {
    try {
        const {
            title,
            description,
            scheduled_time,
            duration,
            zoom_link,
            student_ids,
        } = req.body;

        const teacherId = req.user.id;

        // ✅ Ensure this is a non-empty array of numbers
        if (!Array.isArray(student_ids) || student_ids.length === 0) {
            return res.status(400).json({ error: "Students not selected!" });
        }

        // (Optional) extra type check
        const invalid = student_ids.some(
            (id) => typeof id !== "number" || !Number.isInteger(id)
        );
        if (invalid) {
            return res.status(400).json({ error: "Invalid student_ids format" });
        }

        const newClass = await prisma.class.create({
            data: {
                title,
                description,
                scheduled_time: new Date(scheduled_time),
                duration,
                zoom_link,
                teacher_id: teacherId,
                student_ids, // 👈 saved as JSON
            },
        });

        res.status(201).json({ class: newClass });
    } catch (err) {
        console.error("Create class error:", err);
        res.status(500).json({ error: "Failed to create class" });
    }
});


router.put("/class/:id", authMiddleware, requireTeacher, async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;

        const existingClass = await prisma.class.findUnique({
            where: { class_id: parseInt(id, 10) },
        });

        if (!existingClass || existingClass.teacher_id !== teacherId) {
            return res.status(403).json({ error: "Not authorized to update this class" });
        }

        const { title, description, scheduled_time, duration, zoom_link, student_ids } = req.body;

        const updatedClass = await prisma.class.update({
            where: { class_id: parseInt(id, 10) },
            data: {
                title,
                description,
                scheduled_time: scheduled_time ? new Date(scheduled_time) : existingClass.scheduled_time,
                duration,
                zoom_link,
                student_ids
            },
        });

        res.json({ class: updatedClass });
    } catch (err) {
        console.error("Update class error:", err);
        res.status(500).json({ error: "Failed to update class" });
    }
});

router.delete("/class/:id", authMiddleware, requireTeacher, async (req, res) => {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;
        const classId = parseInt(id, 10);

        if (Number.isNaN(classId)) {
            return res.status(400).json({ error: "Invalid class id" });
        }

        // Make sure class exists and belongs to this teacher
        const existingClass = await prisma.class.findUnique({
            where: { class_id: classId },
        });

        if (!existingClass) {
            return res.status(404).json({ error: "Class not found" });
        }

        if (existingClass.teacher_id !== teacherId) {
            return res.status(403).json({ error: "Not authorized to delete this class" });
        }

        const deletedClass = await prisma.class.delete({
            where: { class_id: classId },
        });

        res.json({ class: deletedClass });
    } catch (err) {
        console.error("Delete class error:", err);
        res.status(500).json({ error: "Failed to delete class" });
    }
});

router.get("/teacher/class", authMiddleware, requireTeacher, async (req, res) => {
    try {
        const teacherId = req.user.id;

        const classes = await prisma.class.findMany({
            where: { teacher_id: teacherId },
            orderBy: { scheduled_time: "desc" },
        });

        res.json({ classes });
    } catch (err) {
        console.error("Fetch teacher classes error:", err);
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

router.get("/student/class", authMiddleware, requireStudent, async (req, res) => {
    try {
        const studentId = req.user.id; // this is the logged-in student id (number)

        // 1️⃣ Get all classes (or you can add extra where clauses if needed)
        const allClasses = await prisma.class.findMany({
            include: {
                teacher: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { scheduled_time: "desc" },
        });

        // 2️⃣ Filter on the Node side using the JSON field student_ids
        const classes = allClasses.filter((cls) => {
            const ids = cls.student_ids ?? [];

            // Prisma returns Json -> treat as any and narrow
            if (!Array.isArray(ids)) return false;

            // Make sure we compare numbers
            return ids.includes(studentId);
        });

        res.json({ classes });
    } catch (err) {
        console.error("Fetch student classes error:", err);
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});


export default router;
