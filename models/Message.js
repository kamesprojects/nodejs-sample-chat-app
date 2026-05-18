import { db } from "../config/db.js";

export const listUserRoomMessages = async (roomId, userId, limit = 20) => {
  return db.manyOrNone(
    `
      SELECT m.id, m.room_id, m.sender_id, m.body, m.created_at, u.display_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = $1
      AND EXISTS (
        SELECT 1 FROM room_members
        WHERE room_id = $1 AND user_id = $2
      )
      ORDER BY m.created_at DESC
      LIMIT $3
    `,
    [roomId, userId, limit],
  );
}

export const findUserMessageByRoomId = async (roomId, userId) => {
  return db.oneOrNone(
    `
      SELECT m.id, m.room_id, m.sender_id, m.body, m.created_at, u.display_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.room_id = $1 AND EXISTS (
        SELECT 1 FROM room_members
        WHERE room_id = $1 AND user_id = $2
      )
      ORDER BY m.created_at DESC
    `,
    [roomId, userId],
  );
};

export const createRoomMessage = async ({
  roomId,
  senderId,
  body,
}) => {
  return db.one(
    `
      INSERT INTO messages (room_id, sender_id, body)
      VALUES ($1, $2, $3)
      RETURNING id, room_id, sender_id, body, created_at
    `,
    [roomId, senderId, body],
  );
};

export const updateRoomMessageById = async (messageId, userId, body) => {
  return db.one(
    `
      UPDATE messages
      SET body = $1, edited_at = NOW()
      WHERE id = $2 AND sender_id = $3
    `,
    [body, messageId, userId],
  );
};

export const deleteRoomMessageById = async (messageId, userId) => {
  return db.none(
    ` 
      DELETE FROM messages
      WHERE id = $1 AND sender_id = $2
    `,
    [messageId, userId],
  );
};
