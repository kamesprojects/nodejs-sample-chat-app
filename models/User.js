import { db } from "../config/db.js";

// one - returns a single user object, or throws an error if not found
export const createUser = async ({
  email,
  passwordHash,
  displayName,
  role,
}) => {
  return db.one(
    `
      INSERT INTO users (email, password_hash, display_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, display_name, role, created_at
    `,
    [email, passwordHash, displayName, role],
  );
};

// oneOrNone - returns null if no user is found, or the user object if found
export const findByEmail = async (email) => {
  return db.oneOrNone(
    `
      SELECT id, email, password_hash, display_name, role, created_at
      FROM users
      WHERE email = $1
    `,
    [email],
  );
};

export const findById = async (userId) => {
  return db.oneOrNone(
    `
      SELECT u.id, u.email, u.display_name, u.role, u.created_at
      FROM users u
      WHERE u.id = $1
    `,
    [userId],
  );
};

export const findByDisplayName = async (displayName) => {
  return db.oneOrNone(
    `
      SELECT id, email, password_hash, display_name, role, created_at
      FROM users
      WHERE display_name = $1
    `,
    [displayName],
  );
};

export const existingUsers = async (email, displayName) => {
  return db.any(
    `
      SELECT id, email, display_name
      FROM users
      WHERE email = $1 OR display_name = $2
    `,
    [email, displayName]
  );
};

// manyOrNone - atleast one user is found, or many users are found
export const listUsers = async () => {
  return db.manyOrNone(
    `
      SELECT id, email, password_hash, display_name, role, created_at
      FROM users
      ORDER BY id DESC
    `,
  );
};
