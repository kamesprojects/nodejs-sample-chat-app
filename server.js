import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import http from "http";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import {resolve} from "path";
import { PORT } from "./config/env.js";

import v1UserRoutes from "./routes/v1/users.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { AppError } from "./utils/errorHandler.js";
import { Server } from "socket.io";
import v1AuthRouter from "./routes/v1/auth.js";
import v1ChatRouter from "./routes/rooms.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const publicPath = resolve(process.cwd(), 'public');
const port = PORT ? PORT : 3000;

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  })
);

app.use(
  cors({
    origin: [`http://localhost:${port}`],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

app.use(morgan("dev"));
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.get("/", (req, res) => {
 res.sendFile(resolve(publicPath, 'index.html'));
});

app.get("/health", (req, res) => {
  console.log(`Server is healthy running on port ${port}`);
  res.status(200).json({ status: "OK" });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/v1/auth", v1AuthRouter);
app.use("/api/v1/users", v1UserRoutes);
app.use("/api/v1/messages", v1MessagesRouter);
app.use("/api/v1/rooms", v1ChatRouter);



app.use((req, res, next) => {
  next(new AppError(404, "Route Not Found"));
});

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});