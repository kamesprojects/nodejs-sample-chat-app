import { JWT_EXPIRES_IN, JWT_SECRET, BCRYPT_SALT_ROUNDS } from "../config/env";
import { AppError } from "../utils/errorHandler";
import { sendSuccess } from "../utils/helpers";
import bcrypt from "bcrypt";
import { existingUsers, createUser, findByEmail } from "../models/userModel.js";
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

export const registerUser = async (req, res, next) => {
  const { email, password, displayName } = req.validatedBody;

  try {
    const existingUsers = await existingUsers(email, displayName);

    if (existingUsers.length > 0) {
      const isEmailTaken = existingUsers.some(u => u.email === email);
      const isDisplayNameTaken = existingUsers.some(u => u.display_name === displayName);

      if (isDisplayNameTaken && !isEmailTaken) {
        return next(new AppError("Display name already taken", 400));
      }
      return next(new AppError("User already exists", 400));
    }

    const passwordHash = await hashPassword(password);

    const newUser = await createUser({
      email,
      passwordHash,
      displayName,
      role: "user",
    });

    const token = generateToken(newUser);

    sendSuccess(res, 201, { user: newUser, token }, "User registered successfully");
  } catch (err) {
    next(new AppError("Error registering user", 500));
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.validatedBody;

  const user = await findByEmail(email);

  if (!user) {
    return next(new AppError("Invalid credentials", 401));
  }

  const passwordMatch = await verifyPassword(password, user.password_hash);

  if (!passwordMatch) {
    return next(new AppError("Invalid credentials", 401));
  }

  const claims = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
  };

  const token = generateToken(claims);

  sendSuccess(res, 200, { user, token }, "Login successful");
};
