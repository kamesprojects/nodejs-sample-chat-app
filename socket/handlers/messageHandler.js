import * as Message from "../../models/Message.js";
import * as Room from "../../models/Room.js";
import { SOCKET_EVENTS } from '../events.js';

export const handleMessageSend = async (socket, io, data) => {
  try {
    const { roomId, body } = data;
    if (!roomId || !body) return socket.emit(SOCKET_EVENTS.ERROR, "Missing data");

    const isMember = await Room.findUserRoomById(roomId, socket.userId);
    if (!isMember) return socket.emit(SOCKET_EVENTS.ERROR, "Not a member");

    const message = await Message.createRoomMessage({
      roomId,
      senderId: socket.userId,
      body,
    });
    socket.to(`room_${roomId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, {
      roomId,
      id: message.id,
      body: message.body,
      sender_id: message.sender_id,
      created_at: message.created_at,
    });
  } catch (err) {
    console.error("message:send error:", err);
    socket.emit(SOCKET_EVENTS.ERROR, "Failed to send message");
  }
};
