import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import "./lib/db";
import { config } from "./lib/config";
import db from "./lib/db";
import authRoutes from "./routes/auth";
import pollRoutes from "./routes/polls";
import voteRoutes from "./routes/votes";
import verifyRoutes from "./routes/verify";
import adminRoutes from "./routes/admin";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = config.PORT;

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json());
app.use(apiLimiter);

// Strict rate limit for auth endpoints
app.use("/api/auth/login", strictLimiter);
app.use("/api/auth/register", strictLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "VoteBlock API is running! 🗳️" });
});

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Initialize admin user (for first deployment, only works if no admin exists)
app.post("/api/init", async (req, res, next) => {
  try {
    const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
    
    if (adminExists) {
      return res.status(400).json({ 
        message: "Admin user already exists",
        credentials: null 
      });
    }

    const ADMIN_USERNAME = "admin";
    const ADMIN_EMAIL = "admin@voteblock.com";
    const ADMIN_PASSWORD = "admin123!";

    const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    db.prepare(
      "INSERT INTO users (id, username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, ADMIN_USERNAME, ADMIN_EMAIL, hashedPassword, "admin", createdAt);

    res.json({ 
      message: "Admin user created successfully",
      credentials: {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware (must come after all routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});
