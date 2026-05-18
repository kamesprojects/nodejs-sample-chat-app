import { z } from "zod";

// POST /api/rooms/:roomId/messages
export const createMessageSchema = z.object({
  body: z.string({ required_error: "The message body is required" })
    .trim() // Automaticky vymaže medzery zo začiatku a konca textu
    .min(1, "The message cannot be empty")
    .max(2000, "The message can be at most 2000 characters long"),
});

// PATCH /messages/:id
export const updateMessageSchema = z.object({
  body: z.string({ required_error: "The new message body is required" })
    .trim()
    .min(1, "The updated message cannot be empty")
    .max(2000, "The message can be at most 2000 characters long"),
});