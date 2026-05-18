import { db } from "../config/db.js";

export const listUserRooms = async (userId, type = null, limit = 20) => {
  return db.manyOrNone(
    `
      SELECT r.id, r.type, r.name, r.created_at, rm.role
      FROM room_members rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.user_id = $1 AND (r.type = $2 OR $2 IS NULL) 
      ORDER BY r.updated_at DESC
      LIMIT $3
    `,
    [userId, type, limit],
  );
};

export const findUserRoomById = async (roomId, userId) => {
  return db.oneOrNone(
    `
      SELECT r.id, r.type, r.name, r.created_at, rm.role
      FROM room_members rm
      JOIN rooms r ON rm.room_id = r.id
      WHERE rm.room_id = $1 AND rm.user_id = $2
    `,
    [roomId, userId],
  );
};

export const createRoom = async (type, name, userId) => {
  return db.one(
    `
      INSERT INTO rooms (type, name, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, type, name, created_by, created_at
    `,
    [type, name, userId],
  );
};

export const findDirectRoomBetweenUsers = async (userIdOne, userIdTwo) => {
  return db.oneOrNone(
    `
      SELECT r.id, r.type, r.name, r.created_at
      FROM rooms r
      JOIN room_members rm ON rm.room_id = r.id
      WHERE r.type = 'direct'
        AND rm.user_id IN ($1, $2)
      GROUP BY r.id
      HAVING COUNT(*) = 2 AND COUNT(DISTINCT rm.user_id) = 2
      ORDER BY r.created_at DESC
      LIMIT 1
    `,
    [userIdOne, userIdTwo],
  );
};

export const createDirectRoomBetweenUsers = async (userIdOne, userIdTwo, name = null) => {
  return db.tx(async (t) => {
    const room = await t.one(
      `
        INSERT INTO rooms (type, name, created_by)
        VALUES ('direct', $1, $2)
        RETURNING id, type, name, created_by, created_at
      `,
      [name, userIdOne],
    );

    await t.none(
      `
        INSERT INTO room_members (room_id, user_id, role)
        VALUES ($1, $2, 'member'), ($1, $3, 'member')
      `,
      [room.id, userIdOne, userIdTwo],
    );

    return room;
  });
};

export const updateRoomById = async (roomId, name) => {
  return db.none(
    `
      UPDATE rooms
      SET name = $1, updated_at = NOW()
      WHERE id = $2
    `,
    [name, roomId],
  );
};

export const deleteRoomById = async (roomId) => {
  return db.none(
    `
      DELETE FROM rooms
      WHERE id = $1
    `,
    [roomId],
  );
};

export const listUserRoomMembers = async (roomId, userId, limit = 20) => {
  return db.manyOrNone(
    `
      SELECT u.id, u.email, u.display_name, rm.role
      FROM room_members rm
      JOIN users u ON rm.user_id = u.id
      WHERE rm.room_id = $1 AND rm.user_id != $2
      AND EXISTS (
        SELECT 1 FROM room_members
        WHERE room_id = $1 AND user_id = $2
      )
      LIMIT $3
    `,
    [roomId, userId, limit],
  );
};

export const findRoomMemberById = async (roomId, userId) => {
  return db.oneOrNone(
    `
      SELECT room_id, user_id, role, joined_at
      FROM room_members
      WHERE room_id = $1 AND user_id = $2
    `,
    [roomId, userId],
  );
};

export const createRoomMember = async (roomId, userId, role = "member") => {
  return db.none(
    `
      INSERT INTO room_members (room_id, user_id, role)
      VALUES ($1, $2, $3)
    `,
    [roomId, userId, role],
  );
};

export const updateRoomMemberRole = async (roomId, userId, role) => {
  return db.none(
    ` 
      UPDATE room_members
      SET role = 'owner'
      WHERE room_id = $1 AND user_id = $2
    `,
    [roomId, userId],
  );
};

export const deleteRoomMemberByUserId = async (roomId, userId) => {
  return db.none(
    ` 
      DELETE FROM room_members
      WHERE room_id = $1 AND user_id = $2
    `,
    [roomId, userId],
  );
};
