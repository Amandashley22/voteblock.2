import express from "express";
import crypto from "crypto";
import db from "../lib/db";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { GENESIS_HASH } from "../lib/chain";
import { createPollSchema, editPollSchema } from "../lib/validation";
import { AppError } from "../middleware/errorHandler";

const router = express.Router();

// Create a poll (admin only)
router.post("/", authenticate, requireAdmin, (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const data = createPollSchema.parse(req.body);

    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const stmt = db.prepare(`
      INSERT INTO polls (id, title, description, options, created_by, ends_at, head_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.title,
      data.description || "",
      JSON.stringify(data.options),
      userId,
      data.endsAt || null,
      GENESIS_HASH,
      createdAt
    );

    res.status(201).json({ message: "Poll created successfully", pollId: id });
  } catch (error) {
    next(error);
  }
});

// List polls
router.get("/", (req, res, next) => {
  try {
    const polls = db.prepare("SELECT * FROM polls ORDER BY created_at DESC").all();
    const formattedPolls = polls.map((p: any) => ({
      ...p,
      options: JSON.parse(p.options),
    }));
    res.json(formattedPolls);
  } catch (error) {
    next(error);
  }
});

// Get single poll
router.get("/:id", (req, res, next) => {
  try {
    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(req.params.id as string);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }
    res.json({
      ...poll,
      options: JSON.parse(poll.options),
    });
  } catch (error) {
    next(error);
  }
});

// Edit poll (only owner, only before votes are cast)
router.put("/:id", authenticate, (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const pollId = req.params.id;
    const data = editPollSchema.parse(req.body);

    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (poll.created_by !== userId) {
      throw new AppError("You are not the owner of this poll", 403);
    }

    if (poll.total_votes > 0) {
      throw new AppError("Cannot edit poll after votes have been cast", 400);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push("title = ?");
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description);
    }
    if (data.options !== undefined) {
      updates.push("options = ?");
      params.push(JSON.stringify(data.options));
    }
    if (data.endsAt !== undefined) {
      updates.push("ends_at = ?");
      params.push(data.endsAt);
    }

    if (updates.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    params.push(pollId);
    const sql = `UPDATE polls SET ${updates.join(", ")} WHERE id = ?`;
    db.prepare(sql).run(...params);

    res.json({ message: "Poll updated successfully" });
  } catch (error) {
    next(error);
  }
});

// Close poll (owner or admin)
router.patch("/:id/close", authenticate, (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const pollId = req.params.id;

    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (poll.created_by !== userId && req.user?.role !== "admin") {
      throw new AppError("You are not the owner of this poll", 403);
    }

    db.prepare("UPDATE polls SET is_open = 0 WHERE id = ?").run(pollId);

    res.json({ message: "Poll closed successfully" });
  } catch (error) {
    next(error);
  }
});

// Delete poll (owner or admin)
router.delete("/:id", authenticate, (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const pollId = req.params.id;

    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (poll.created_by !== userId && req.user?.role !== "admin") {
      throw new AppError("You are not the owner of this poll", 403);
    }

    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM vote_blocks WHERE poll_id = ?").run(pollId);
      db.prepare("DELETE FROM polls WHERE id = ?").run(pollId);
    });

    transaction();

    res.json({ message: "Poll deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
