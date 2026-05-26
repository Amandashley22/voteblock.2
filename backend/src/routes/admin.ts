import express from "express";
import db from "../lib/db";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats - Dashboard statistics
router.get("/stats", (req: AuthRequest, res, next) => {
  try {
    const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;
    const totalPolls = (db.prepare("SELECT COUNT(*) as count FROM polls").get() as any).count;
    const totalVotes = (db.prepare("SELECT COALESCE(SUM(total_votes), 0) as count FROM polls").get() as any).count;
    const activePolls = (db.prepare("SELECT COUNT(*) as count FROM polls WHERE is_open = 1").get() as any).count;

    // Recent activity - last 7 days vote counts per day
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const dailyVotes = db.prepare(`
      SELECT
        CAST((timestamp / 86400000) AS INTEGER) as day_key,
        COUNT(*) as count
      FROM vote_blocks
      WHERE timestamp >= ?
      GROUP BY day_key
      ORDER BY day_key ASC
    `).all(sevenDaysAgo) as any[];

    // Poll status distribution
    const openPolls = (db.prepare("SELECT COUNT(*) as count FROM polls WHERE is_open = 1").get() as any).count;
    const closedPolls = (db.prepare("SELECT COUNT(*) as count FROM polls WHERE is_open = 0").get() as any).count;

    // Recent users this week
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersThisWeek = (db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= ?").get(oneWeekAgo) as any).count;

    // Votes today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const votesToday = (db.prepare("SELECT COUNT(*) as count FROM vote_blocks WHERE timestamp >= ?").get(todayStart.getTime()) as any).count;

    res.json({
      totalUsers,
      totalPolls,
      totalVotes,
      activePolls,
      newUsersThisWeek,
      votesToday,
      dailyVotes,
      pollStatusDistribution: { open: openPolls, closed: closedPolls },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - List all users
router.get("/users", (req: AuthRequest, res, next) => {
  try {
    const users = db.prepare(`
      SELECT
        u.id, u.username, u.email, u.role, u.created_at,
        (SELECT COUNT(*) FROM polls WHERE created_by = u.id) as polls_created,
        (SELECT COUNT(*) FROM vote_blocks WHERE voter_id IN (
          SELECT voter_id FROM vote_blocks WHERE poll_id IN (SELECT id FROM polls)
        ) AND voter_id LIKE '%' || substr(u.id, 1, 8) || '%') as approx_votes
      FROM users u
      ORDER BY u.created_at DESC
    `).all() as any[];

    // Get actual vote counts per user using a simpler approach
    const usersWithVotes = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.created_at,
      pollsCreated: u.polls_created,
    }));

    res.json(usersWithVotes);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/polls - List all polls with extra detail
router.get("/polls", (req: AuthRequest, res, next) => {
  try {
    const polls = db.prepare(`
      SELECT
        p.*,
        u.username as creator_name
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `).all() as any[];

    const formatted = polls.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      options: JSON.parse(p.options),
      createdBy: p.created_by,
      creatorName: p.creator_name || "Unknown",
      endsAt: p.ends_at,
      isOpen: p.is_open === 1,
      headHash: p.head_hash,
      totalVotes: p.total_votes,
      createdAt: p.created_at,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reports - Reporting data
router.get("/reports", (req: AuthRequest, res, next) => {
  try {
    // Votes per day over last 14 days
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const votesPerDay = db.prepare(`
      SELECT
        CAST((timestamp / 86400000) AS INTEGER) as day_key,
        COUNT(*) as count
      FROM vote_blocks
      WHERE timestamp >= ?
      GROUP BY day_key
      ORDER BY day_key ASC
    `).all(fourteenDaysAgo) as any[];

    // Top 5 polls by votes
    const topPolls = db.prepare(`
      SELECT id, title, total_votes
      FROM polls
      ORDER BY total_votes DESC
      LIMIT 5
    `).all() as any[];

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
    const monthlyRegistrations = db.prepare(`
      SELECT
        CAST((created_at / 2592000000) AS INTEGER) as month_key,
        COUNT(*) as count
      FROM users
      WHERE created_at >= ?
      GROUP BY month_key
      ORDER BY month_key ASC
    `).all(sixMonthsAgo) as any[];

    // Quick stats
    const avgVotes = (db.prepare("SELECT COALESCE(AVG(total_votes), 0) as avg FROM polls").get() as any).avg;
    const totalVotes = (db.prepare("SELECT COUNT(*) as count FROM vote_blocks").get() as any).count;
    const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count;

    res.json({
      votesPerDay,
      topPolls,
      monthlyRegistrations,
      avgVotesPerPoll: Math.round(avgVotes),
      totalVotesCast: totalVotes,
      totalRegisteredUsers: totalUsers,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id - Delete a user (admin only)
router.delete("/users/:id", (req: AuthRequest, res, next) => {
  try {
    const userId = req.params.id;

    if (userId === req.user?.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const transaction = db.transaction(() => {
      // Delete user's polls and their vote blocks
      const userPolls = db.prepare("SELECT id FROM polls WHERE created_by = ?").all(userId) as any[];
      for (const poll of userPolls) {
        db.prepare("DELETE FROM vote_blocks WHERE poll_id = ?").run(poll.id);
      }
      db.prepare("DELETE FROM polls WHERE created_by = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    });

    transaction();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
