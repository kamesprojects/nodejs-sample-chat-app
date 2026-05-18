
export const SOCKET_EVENTS = {
  // Client → Server (emit)
  JOIN_ROOM: 'join_room',
  MESSAGE_SEND: 'message:send',
  
  // Server → Client (emit)
  MESSAGE_NEW: 'message:new',
  ERROR: 'error',
  DISCONNECT: 'disconnect',
  
  // Socket.IO internal
  CONNECTION: 'connection',
};