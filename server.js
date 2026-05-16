import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import {resolve} from "path";
import { PORT, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "./utils/config";
import pgPromise from 'pg-promise';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const publicPath = resolve(process.cwd(), 'public');
const port = PORT ? PORT : 3001;
const pgp = pgPromise();
const connectionString = {
  host: 'localhost',
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD
}
const db = pgp(connectionString);

app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// app.use(helmet());
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

app.use(express.static(publicPath));

app.get("/", (req, res) => {
 res.sendFile(resolve(publicPath, 'index.html'));
});

app.get("/health", (req, res) => {
  console.log(`Server is healthy running on port ${port}`);
  res.status(200).json({ status: "OK" });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`A User connected`);

  socket.on('chat-sent', async (msg) => {
    console.log(`Chat message received: ${msg}`);

    try {
      await db.none('INSERT INTO messages(content) VALUES($1)', [msg]);
      
      // Broadcast the message to all connected clients
      io.emit('chat-received', msg);
    } catch (error) {
      console.error('Error inserting message:', error);
    }
    
  });

   // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`A User disconnected`);
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: "Internal Server Error" });
});
