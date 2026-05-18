import { AppError } from "../utils/errorHandler.js";
import * as User from "../models/User.js";
import * as Room from "../models/Room.js";
import { ensureUserAccess } from "../middleware/auth.js";
import { sendSuccess } from "../utils/helpers.js";

export const getUsers = async (req, res, next) => {
  const userId = req.user.id;

  try {
    if (!req.user || !userId) {
      return next(new AppError(401, "Unauthorized: No user information"));
    }
    ensureUserAccess(userId);
    const users = await User.findAll();
    sendSuccess(res, users);
  } catch (err) {
    next(new AppError(500, "Internal server error"));
  }
};

export const getUserProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    if (!req.user || !userId) {
      return next(new AppError(401, "Unauthorized: No user information"));
    }
    
    const [user, rooms] = await Promise.all([
      User.findById(userId),
      Room.listUserRooms(userId),
    ]);

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    sendSuccess(res, { user, rooms });
  } catch (err) {
    console.error("getUserProfile error:", err);
    next(new AppError(500, "Internal server error"));
  }
};

export const createUser = async (req, res, next) => {
  const { email, password, displayName } = req.validatedBody;

  try {
    const newUser = await User.create({ email, password, displayName });
    sendSuccess(res, 201, newUser);
  } catch (err) {
    next(new AppError(500, "Internal server error"));
  }
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError(404, "User not found"));
    }
    sendSuccess(res, user);
  } catch (err) {
    next(new AppError(500, "Internal server error"));
  }
};

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { email, password, displayName } = req.validatedBody;
  try {
    const updatedUser = await User.update(id, { email, password, displayName });
    if (!updatedUser) {
      return next(new AppError(404, "User not found"));
    }
    res.json(updatedUser);
  } catch (err) {
    next(new AppError(500, "Internal server error"));
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleted = await User.delete(id);
    if (!deleted) {
      return next(new AppError(404, "User not found"));
    }
    res.status(204).send();
  } catch (err) {
    next(new AppError(500, "Internal server error"));
  }
};
