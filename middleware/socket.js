import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const verifySocketAuth = (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie || "";
    const token = cookies
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.slice("token=".length);
    if (!token) return next(new Error("Unauthorized: No token"));

    const decoded = jwt.verify(decodeURIComponent(token), JWT_SECRET);
    socket.userId = decoded.id;
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
};
