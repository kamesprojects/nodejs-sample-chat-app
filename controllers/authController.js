import { JWT_EXPIRES_IN, JWT_SECRET, BCRYPT_SALT_ROUNDS } from "../config/env.js";
import { AppError } from "../utils/errorHandler.js";
import { sendSuccess } from "../utils/helpers.js";
import bcrypt from "bcrypt";
import { existingUsers, createUser, findByEmail } from "../models/User.js";
import jwt from "jsonwebtoken";

async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function generateToken(user) {
  const claims = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
  };
  return jwt.sign(claims, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function cookiesOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24, // 24 hour
  }
}

export const registerUser = async (req, res, next) => {
  const { email, password, displayName } = req.validatedBody;

  try {
    const existing = await existingUsers(email, displayName);

    if (existing.length > 0) {
      const isEmailTaken = existing.some(u => u.email === email);
      const isDisplayNameTaken = existing.some(u => u.display_name === displayName);

      if (isDisplayNameTaken && !isEmailTaken) {
        return next(new AppError(400, "Display name already taken"));
      }
      return next(new AppError(400, "User already exists"));
    }

    const passwordHash = await hashPassword(password);

    const newUser = await createUser({
      email,
      passwordHash,
      displayName,
      role: "user",
    });

    const token = generateToken(newUser);

    res.cookie("token", token, cookiesOptions());
    sendSuccess(res, 201, { user: newUser, token }, "User registered successfully");
  } catch (err) {
    next(new AppError(500, "Error registering user"));
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.validatedBody;

  const user = await findByEmail(email);

  if (!user) {
    return next(new AppError(401, "Invalid credentials"));
  }

  const passwordMatch = await verifyPassword(password, user.password_hash);

  if (!passwordMatch) {
    return next(new AppError(401, "Invalid credentials"));
  }

  const claims = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
  };

  const token = generateToken(claims);
  res.cookie("token", token, cookiesOptions());

  sendSuccess(res, 200, { user, token }, "Login successful");
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  })
  sendSuccess(res, 200, null, "Logout successful");
};