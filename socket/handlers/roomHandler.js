import * as Room from "../../models/Room.js";
import { SOCKET_EVENTS } from '../events.js';

export const handleJoinRoom = async (socket, roomId) => {
  try {
    const isMember = await Room.findUserRoomById(roomId, socket.userId);
    if (!isMember) return socket.emit(SOCKET_EVENTS.ERROR, "Not a member");

    socket.join(`room_${roomId}`);
    console.log(`Socket ${socket.id} joined room_${roomId}`);
  } catch (err) {
    console.error("join_room error:", err);
    socket.emit(SOCKET_EVENTS.ERROR, "Failed to join room");
  }
};
