import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import { JWT_SECRET } from "../config/env.js";
import { AppError } from "../utils/errorHandler.js";

export const authenticateToken = (req, res, next) => {
  // const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return next(new AppError("Unauthorized: No token provided", 401));
  // }

  // const token = authHeader.split(" ")[1];
  const token = req.cookies.token;

  if (!token) {
    return next(new AppError(401, "Unauthorized: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    return next(new AppError(401, "Unauthorized: Invalid token"));
  }
};

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      return next(new AppError(401, "Unauthorized: Insufficient permissions"));
    }
  };
}

export function ensureUserAccess(id) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized: No user information"));
    }

    if (req.user.role === "admin") {
      next();
    }

    if (req.user.id !== id) {
      return next(new AppError(401, "Unauthorized: Insufficient permissions"));
    }

    next();
  };
}
