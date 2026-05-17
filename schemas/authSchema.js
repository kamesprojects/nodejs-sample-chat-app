import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(80),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});