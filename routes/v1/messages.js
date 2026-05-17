import express from "express";
import { getMessage, getMesasgeById, createMessage, updateMesasge, deleteMessage } from "../../controllers/messageController.js";
import { authenticateToken } from "../controllers/authController.js";

const router = express.Router();

router.get('/', authenticateToken, getMessage);
router.get('/:id', authenticateToken, getMessageById);
router.post('/', authenticateToken, createMessage);
router.put('/:id', authenticateToken, updateMessage);
router.delete('/:id', authenticateToken, deleteMessage);

export default router;
