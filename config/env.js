import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.NODE_PORT || 3000;
export const DB_HOST = process.env.DB_HOST || "postgres-db";
export const DB_PORT = process.env.DB_PORT || 5432;
export const DB_USER = process.env.DB_USER || "user";
export const DB_PASSWORD = process.env.DB_PASSWORD || "password";
export const DB_NAME = process.env.DB_NAME || "mydb";
export const DB_URL =
  process.env.DB_URL ||
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

export const CORS_ORIGIN = process.env.CORS_ORIGIN || `http://localhost:${PORT}`;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
