import { db } from "../config/db.js";
import { AppError } from "../utils/errorHandler.js";
import { errorHandler } from "../middleware/errorMiddleware.js";
import * as Room from "../models/Room.js";
import { sendSuccess } from "../utils/helpers.js";

// ------------------------------
// ROOMS:
// ------------------------------

export const getRooms = async (req, res, next) => {
  const userId = req.user.id;
  const { type } = req.query || "direct";

  try {
    const rooms = await Room.listUserRooms(userId, type);
    return sendSuccess(res, rooms);
  } catch (err) {
    next(err);
  }
};

export const getRoomById = async (req, res, next) => {
  const userId = req.user.id;
  const { roomId } = req.params;

  try {
    const room = await Room.findUserRoomById(roomId, userId);

    if (!room) {
      return next(new AppError(404, "Room not found or access denied"));
    }

    return sendSuccess(res, room);
  } catch (err) {
    next(err);
  }
};

export const createRoom = async (req, res, next) => {
  const { type, name } = req.validatedBody;
  const userId = req.user.id;

  try {
    const room = await Room.createRoom({ type, name, userId });
    return sendSuccess(res, room);
  } catch (err) {
    next(err);
  }
};

export const updateRoomName = async (req, res, next) => {
  const { roomId } = req.params;
  const { name } = req.validatedBody;
  const userId = req.user.id;

  try {
    if (!roomId) {
      return next(new AppError(400, "Room ID is required"));
    }
    const isRoomMember = await Room.findUserRoomById(roomId, userId);
    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }
    if (isRoomMember.role !== "owner") {
      return next(new AppError(403, "Only room owners can update room names"));
    }
    const room = await Room.updateRoomById(roomId, name);
    return sendSuccess(res, room);
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    if (!roomId) {
      return next(new AppError(400, "Room ID is required"));
    }

    const isRoomMember = await Room.findUserRoomById(roomId, userId);
    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }
    if (isRoomMember.role !== "owner") {
      return next(new AppError(403, "Only room owners can delete rooms"));
    }

    await Room.deleteRoom(roomId, userId);
    return sendSuccess(res, null, "Room deleted successfully");
  } catch (err) {
    next(err);
  }
};

// ------------------------------
// ROOM MEMBERS:
// ------------------------------

export const listRoomMembers = async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    if (!roomId) {
      return next(new AppError(400, "Room ID is required"));
    }
    const members = await Room.listRoomMembers(roomId, userId);
    return sendSuccess(res, members);
  } catch (err) {
    next(err);
  }
};

export const getRoomMemberById = async (req, res, next) => {
  const { roomId, memberId } = req.params;
  const userId = req.user.id;
  try {
    if (!roomId || !memberId) {
      return next(new AppError(400, "Room ID and Member ID are required"));
    }
    const member = await Room.getRoomMemberById(roomId, memberId, userId);
    if (!member) {
      return next(
        new AppError(404, "Member not found in this room or access denied"),
      );
    }
    return sendSuccess(res, member);
  } catch (err) {
    next(err);
  }
};

export const addRoomMember = async (req, res, next) => {
  const { roomId } = req.params;
  const { user_id, role } = req.validatedBody;
  const userId = req.user.id;

  try {
    if (!roomId) {
      return next(new AppError(400, "Room ID is required"));
    }

    const isRoomMember = await Room.findUserRoomById(roomId, userId);
    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }

    if (isRoomMember.role !== "owner") {
      return next(new AppError(403, "Only room owners can add members"));
    }

    const member = await Room.addRoomMember(roomId, user_id, role, userId);
    return sendSuccess(res, member, "Member added successfully");
  } catch (err) {
    next(err);
  }
};

export const updateRoomMemberRole = async (req, res, next) => {
  const { roomId, memberId } = req.params;
  const { role } = req.validatedBody;
  const userId = req.user.id;

  try {
    if (!roomId || !memberId) {
      return next(new AppError(400, "Room ID and Member ID are required"));
    }
    const isRoomMember = await Room.findUserRoomById(roomId, userId);
    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }
    if (isRoomMember.role !== "owner") {
      return next(
        new AppError(403, "Only room owners can update member roles"),
      );
    }
    await Room.updateRoomMemberRole(roomId, memberId, role, userId);
    return sendSuccess(res, null, "Member role updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteRoomMember = async (req, res, next) => {
  const { roomId, memberId } = req.params;
  const userId = req.user.id;

  try {
    if (!roomId || !memberId) {
      return next(new AppError(400, "Room ID and Member ID are required"));
    }
    const isRoomMember = await Room.findUserRoomById(roomId, userId);
    if (!isRoomMember) {
      return next(new AppError(403, "You are not a member of this room"));
    }

    if (isRoomMember.role !== "owner") {
      return next(new AppError(403, "Only room owners can remove members"));
    }
    await Room.deleteRoomMember(roomId, memberId, userId);
    return sendSuccess(res, null, "Member removed successfully");
  } catch (err) {
    next(err);
  }
};
