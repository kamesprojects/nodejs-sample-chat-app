import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../../controllers/authController.js";
import { validate } from "../../middleware/validation.js";
import { loginSchema, registerSchema } from "../../schemas/authSchema.js";

const router = express.Router();

router.post("/login", validate(loginSchema), loginUser);
router.post("/register", validate(registerSchema), registerUser);
router.post("/logout", logoutUser);

export default router;
