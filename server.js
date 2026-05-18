import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import http from "http";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import { resolve } from "path";
import { PORT } from "./config/env.js";
import compression from "compression";
import v1UserRoutes from "./routes/v1/users.js";
import v1RoomRouter from "./routes/v1/rooms.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { AppError } from "./utils/errorHandler.js";
import { Server } from "socket.io";
import v1AuthRouter from "./routes/v1/auth.js";
// import v1ChatRouter from "./routes/rooms.js";
import cookieParser from "cookie-parser";
import { CORS_ORIGIN, JWT_SECRET } from "./config/env.js";
import jwt from "jsonwebtoken";
import * as Message from "./models/Message.js";
import * as Room from "./models/Room.js";
import { db } from "./config/db.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [CORS_ORIGIN],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const publicPath = resolve(process.cwd(), "public");
const port = PORT ? PORT : 3000;

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", `https://cdn.tailwindcss.com`],
        scriptSrcAttr: ["'unsafe-inline'"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  }),
);

app.use(
  cors({
    origin: [CORS_ORIGIN],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Authorization"],
  }),
);

app.use(morgan("dev"));
app.use(compression());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO middleware: verify JWT from cookie
io.use((socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie || "";
    const token = cookies
      .split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return next(new Error("Unauthorized: No token"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
});

app.get("/", (req, res) => {
  res.sendFile(resolve(publicPath, "index.html"));
});

app.get("/health", (req, res) => {
  console.log(`Server is healthy running on port ${port}`);
  res.status(200).json({ status: "OK" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/auth", v1AuthRouter);
app.use("/api/v1/users", v1UserRoutes);
app.use("/api/v1/rooms", v1RoomRouter);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id} (userId: ${socket.userId})`);

  socket.on("join_room", async (roomId) => {
    try {
      // Verify membership
      const isMember = await Room.findUserRoomById(roomId, socket.userId);
      if (!isMember) {
        return socket.emit("error", "Not a member of this room");
      }
      socket.join(`room_${roomId}`);
      console.log(`Socket ${socket.id} joined room_${roomId}`);
    } catch (err) {
      console.error("join_room error:", err);
      socket.emit("error", "Failed to join room");
    }
  });

  socket.on("message:send", async (data) => {
    try {
      const { roomId, body } = data;

      if (!roomId || !body) {
        return socket.emit("error", "Missing roomId or body");
      }

      // Verify membership
      const isMember = await Room.findUserRoomById(roomId, socket.userId);
      if (!isMember) {
        return socket.emit("error", "Not a member of this room");
      }

      // Create message
      const message = await Message.createMessage({
        roomId,
        senderId: socket.userId,
        body
      });

      // Emit to room
      io.to(`room_${roomId}`).emit("message:new", {
        roomId,
        body: message.body,
        sender_id: message.sender_id,
        created_at: message.created_at,
        id: message.id
      });
    } catch (err) {
      console.error("message:send error:", err);
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use((req, res, next) => {
  next(new AppError(404, "Route Not Found"));
});

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
