import express from "express";
import {
  listRoomMessages,
  getMessageByRoomId,
  createRoomMessage,
  deleteRoomMessage,
  updateRoomMessage,
} from "../../controllers/messageController.js";
import { authenticateToken } from "../../middleware/auth.js";
import {
  createMessageSchema,
  updateMessageSchema,
} from "../../schemas/messageSchema.js";
import { validate } from "../../middleware/validation.js";

const router = express.Router();

router.get("/", authenticateToken, listRoomMessages);
router.get("/:messageId", authenticateToken, getMessageByRoomId);
router.post(
  "/",
  authenticateToken,
  validate(createMessageSchema),
  createRoomMessage,
);
router.patch(
  "/:messageId",
  authenticateToken,
  validate(updateMessageSchema),
  updateRoomMessage,
);
router.delete("/:messageId", authenticateToken, deleteRoomMessage);

export default router;
