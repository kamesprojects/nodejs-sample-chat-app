import { z } from "zod";

export const sendMessageSchema = z.object({
  roomId: z.number().int().positive(),
  content: z.string().min(1).max(2000),
});