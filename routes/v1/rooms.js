import express from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoomName,
  deleteRoom,
  listRoomMembers,
  getRoomMemberById,
  addRoomMember,
  updateRoomMemberRole,
  deleteRoomMember,
} from "../../controllers/roomController.js";
import v1MessagesRouter from "../../routes/v1/messages.js";
import { authenticateToken } from "../../middleware/auth.js";
import { validate } from "../../middleware/validation.js";
import { createRoomSchema, addRoomMemberSchema, updateRoomSchema, updateRoomMemberRoleSchema } from "../../schemas/roomSchema.js";

const router = express.Router();
// ------------------------------
// ROOMS:
// ------------------------------
router.get("/", authenticateToken, getRooms);
router.get("/:roomId", authenticateToken, getRoomById);
router.post("/", authenticateToken, validate(createRoomSchema), createRoom);
router.patch("/:roomId", authenticateToken, validate(updateRoomSchema), updateRoomName);
router.delete("/:roomId", authenticateToken, deleteRoom);

// ------------------------------
// ROOM MEMBERS:
// ------------------------------

router.get("/:roomId/members", authenticateToken, listRoomMembers);
router.get("/:roomId/members/:memberId", authenticateToken, getRoomMemberById);
router.post("/:roomId/members", authenticateToken, validate(addRoomMemberSchema), addRoomMember);
router.patch("/:roomId/members/:memberId", authenticateToken, validate(updateRoomMemberRoleSchema), updateRoomMemberRole);
router.delete("/:roomId/members/:memberId", authenticateToken, deleteRoomMember);

// ------------------------------
// ROOM MESSAGES:
// ------------------------------

router.use("/:roomId/messages", v1MessagesRouter);

export default router;
