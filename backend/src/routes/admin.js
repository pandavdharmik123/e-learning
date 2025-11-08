import express from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../lib/auth.js";

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
};

router.get("/admin/users", authMiddleware, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                NOT: { role: "admin" },
                is_deleted: false,
            },
            include: {
                teacher: true,
                student: true,
            },
            orderBy: { user_id: "asc" },
        });

        res.json({ users });
    } catch (err) {
        console.error("Get all users error:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.put("/admin/users/:id/verify", authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        if (typeof is_verified !== "boolean") {
            return res.status(400).json({ error: "is_verified must be a boolean" });
        }

        const updatedUser = await prisma.user.update({
            where: { user_id: Number(id) },
            data: { is_verified },
        });

        res.json({ message: "User verification status updated", user: updatedUser });
    } catch (err) {
        console.error("Update verification error:", err);
        res.status(500).json({ error: "Failed to update verification status" });
    }
});

router.delete("/admin/users/:id", authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { user_id: Number(id) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Soft delete user (mark as deleted)
        const deletedUser = await prisma.user.update({
            where: { user_id: Number(id) },
            data: { is_deleted: true },
        });

        res.json({ message: "User marked as deleted", user: deletedUser });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});


router.put("/admin/users/:id/restore", authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const restoredUser = await prisma.user.update({
            where: { user_id: Number(id) },
            data: { is_deleted: false },
        });

        res.json({ message: "User restored successfully", user: restoredUser });
    } catch (err) {
        console.error("Restore user error:", err);
        res.status(500).json({ error: "Failed to restore user" });
    }
});


export default router;
