import { z } from "zod";

// ------------------------------
// ROOMS:
// ------------------------------

// POST /api/rooms
export const createRoomSchema = z.object({
  name: z.string()
    .min(1, "The Name is required for group chats")
    .max(100, "The Name can be at most 100 characters long")
    .optional() 
    .nullable(),
  email: z.string().email("The email is invalid").optional().nullable(),
  type: z.enum(["direct", "group"], {
    errorMap: () => ({ message: "The Type must be either 'direct' or 'group'" }),
  }).default("direct"),
});

// PATCH /api/rooms/:id
export const updateRoomSchema = z.object({
  name: z.string().min(1, "The new name cannot be empty").max(100),
});

// ------------------------------
// ROOM MEMBERS:
// ------------------------------

// POST /api/rooms/:roomId/members
export const addRoomMemberSchema = z.object({
  user_id: z.number({ required_error: "The user ID is required" }).int().positive(),
  role: z.enum(["member", "owner"]).default("member"), 
});

// POST /api/rooms/:roomId/members/email
export const addRoomMemberByEmailSchema = z.object({
  email: z.string().email("The email is invalid"),
  role: z.enum(["member", "owner"]).default("member"),
});

// PATCH /api/rooms/:roomId/members/:memberId
export const updateRoomMemberRoleSchema = z.object({
  role: z.enum(["member", "owner"], {
    errorMap: () => ({ message: "You can only change the role to 'member' or 'owner'" }),
  }),
});