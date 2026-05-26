import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../lib/db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { registerSchema, loginSchema, updateUserSchema, changePasswordSchema } from "../lib/validation";
import { config } from "../lib/config";
import { AppError } from "../middleware/errorHandler";

const router = express.Router();

// Register
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const stmt = db.prepare(
      "INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)"
    );

    stmt.run(id, data.username, data.email, hashedPassword, createdAt);

    res.status(201).json({ message: "User registered successfully", userId: id });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, config.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, userId: user.id, username: user.username, role: user.role });
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get("/profile", authenticate, (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const user: any = db.prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ?").get(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
});

// Update user settings
router.put("/profile", authenticate, (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const data = updateUserSchema.parse(req.body);

    const updates: string[] = [];
    const params: any[] = [];

    if (data.username !== undefined) {
      updates.push("username = ?");
      params.push(data.username);
    }
    if (data.email !== undefined) {
      updates.push("email = ?");
      params.push(data.email);
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    db.prepare(sql).run(...params);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post("/change-password", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const data = changePasswordSchema.parse(req.body);

    const user: any = db.prepare("SELECT password FROM users WHERE id = ?").get(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const passwordMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!passwordMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedNewPassword, userId);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
