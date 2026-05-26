import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createPollSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  options: z.array(z.string().min(1)).min(2),
  endsAt: z.number().optional().nullable(),
});

export const editPollSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  options: z.array(z.string().min(1)).min(2).optional(),
  endsAt: z.number().optional().nullable(),
});

export const castVoteSchema = z.object({
  choice: z.string().min(1),
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});
