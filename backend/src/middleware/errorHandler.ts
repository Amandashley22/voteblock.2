import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation error: " + err.issues.map((i) => i.message).join(", ");
  }

  if (err.code === "SQLITE_CONSTRAINT" || err.message?.includes("UNIQUE constraint failed")) {
    statusCode = 400;
    if (err.message.includes("users.username")) {
      message = "Username already exists";
    } else if (err.message.includes("users.email")) {
      message = "Email already exists";
    } else if (err.message.includes("vote_blocks.poll_id, vote_blocks.voter_id") || err.message.includes("vote_blocks")) {
      message = "You have already voted in this poll";
    }
  }

  console.error("Error:", err);

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
