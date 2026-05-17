import { db } from "../config/db.js";
import { AppError } from "../utils/errorHandler.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

export const createMessage = async (req, res, next) => {
  const { content } = req.body;

  try {
    await db.none("INSERT INTO messages(content) VALUES($1)", [content]);

    res.status(201).json({ message: "Message created successfully" });
  } catch (error) {
    console.error("Error inserting message:", error);
    next(new AppError(500, "Internal server error"));
  }
};
