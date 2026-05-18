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

// Admin-only routes for user management
router.get("/", authenticateToken, requireRole("admin"), getUsers);
router.get("/:id", authenticateToken, requireRole("admin"), getUserById);
router.post("/", authenticateToken, requireRole("admin"), createUser);

// Additional route for user profile
router.get("/profile", authenticateToken, getUserProfile);
router.patch("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
