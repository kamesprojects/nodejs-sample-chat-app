import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.NODE_PORT || 3001;
export const DB_PORT = process.env.DB_PORT || 5432;
export const DB_USER = process.env.DB_USER || "user";
export const DB_PASSWORD = process.env.DB_PASSWORD || "password";
export const DB_NAME = process.env.DB_NAME || "mydb";
export const DB_URL =
  process.env.DB_URL ||
  `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`;
