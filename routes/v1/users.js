import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
} from "../../controllers/userController.js";
import { authenticateToken, requireRole } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, requireRole("admin"), getUsers);
router.get("/profile", authenticateToken, getUserProfile);
router.get("/:id", authenticateToken, requireRole("admin"), getUserById);
router.post("/", authenticateToken, requireRole("admin"), createUser);


router.patch("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
