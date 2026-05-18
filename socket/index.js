import { handleJoinRoom } from "./handlers/roomHandler.js";
import { handleMessageSend } from "./handlers/messageHandler.js";
import { SOCKET_EVENTS } from './events.js';

export const registerSocketHandlers = (socket, io) => {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId) => handleJoinRoom(socket, roomId));
  socket.on(SOCKET_EVENTS.MESSAGE_SEND, (data) => handleMessageSend(socket, io, data));
  socket.on(SOCKET_EVENTS.DISCONNECT, () => console.log(`User disconnected: ${socket.id}`));
};
