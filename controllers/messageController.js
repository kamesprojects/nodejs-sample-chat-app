import { db } from "../config/db.js";
import { AppError } from "../utils/errorHandler.js";
import { errorHandler } from "../middleware/errorMiddleware.js";
import * as Message from "../models/Message.js";
import * as Room from "../models/Room.js";
import { sendSuccess } from "../utils/helpers.js";

export const listRoomMessages = async (req, res, next) => {
  const userId = req.user.id;
  const { roomId } = req.params;

  try {
    if (!roomId) {
      return next(new AppError(400, "Room ID is required"));
    }
    const messages = await Message.listUserRoomMessages(roomId, userId);
    return sendSuccess(res, 200, messages);
  } catch (err) {
    next(err);
  }
};

export const getMessageByRoomId = async (req, res, next) => {
  const userId = req.user.id;
  const { roomId } = req.params;

  try {
    const message = await Message.findUserMessageByRoomId(roomId, userId);
    if (!message) {
      return next(new AppError(404, "Message not found or access denied"));
    }
    return sendSuccess(res, 200, message);
  } catch (err) {
    next(err);
  }
};

export const createRoomMessage = async (req, res, next) => {
  const { body } = req.validatedBody;
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const isRoomMember = await Room.findUserRoomById(roomId, userId);

    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }

    const createdMessage = await Message.createRoomMessage(
      roomId,
      userId,
      body,
    );

    req.io.to(`room_${roomId}`).emit("receive_message", createdMessage);

    return sendSuccess(res, 201, createdMessage, "Message created successfully");
  } catch (error) {
    console.error("Error inserting message:", error);
    next(new AppError(500, "Internal server error"));
  }
};

export const updateRoomMessage = async (req, res, next) => {
  const { body } = req.validatedBody;
  const { roomId, messageId } = req.params;
  const userId = req.user.id;

  try {
    const isRoomMember = await Room.findUserRoomById(roomId, userId);
    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }

    const updatedMessage = await Message.updateRoomMessageById(
      messageId,
      userId,
      body,
    );

    req.io.to(`room_${roomId}`).emit("update_message", updatedMessage);

    return sendSuccess(res, 200, updatedMessage, "Message updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteRoomMessage = async (req, res, next) => {
  const { roomId, messageId } = req.params;
  const userId = req.user.id;

  try {
     const isRoomMember = await Room.findUserRoomById(roomId, userId);
    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }

    await Message.deleteRoomMessageById(messageId, userId);

    req.io.to(`room_${roomId}`).emit("delete_message", { messageId });

    return sendSuccess(res, 200, { messageId }, "Message deleted successfully");
  } catch (err) {
    next(err);
  }
};
