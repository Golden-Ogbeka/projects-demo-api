import { Server as SocketIOServer } from "socket.io";
import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { getDatabasePath } from "./config/db.js";
import { PORT, PRODUCT_NAME } from "./config/constants.js";
import { sendErrorFeedback } from "./functions/feedback.js";
import { errorHandler } from "./middleware/error.js";
import logger from "./middleware/logger.js";
import { projectModules, setupProjectDatabases } from "./projects/index.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(hpp());
app.use(compression());
app.use(express.urlencoded({ extended: false, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(logger);

setupProjectDatabases();

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Welcome to ${PRODUCT_NAME}`,
    data: {
      health: "/health",
      projects: projectModules.map((projectModule) => ({
        name: projectModule.name,
        basePath: projectModule.basePath,
      })),
    },
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API is healthy",
    data: {
      database: "sqlite",
      databasePath: getDatabasePath(),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

projectModules.forEach((projectModule) => {
  app.use(projectModule.basePath, projectModule.router);
});

app.use((_req, res) => {
  return sendErrorFeedback(res, 404, "API route not found.");
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  const baseUrl = `http://localhost:${PORT}`;
  console.log("");
  console.log(`${PRODUCT_NAME} running on port ${PORT}`);
  console.log(`Server: ${baseUrl}`);
  console.log(`Health: ${baseUrl}/health`);
  console.log("Projects:");
  projectModules.forEach((projectModule) => {
    console.log(`- ${projectModule.name}: ${baseUrl}${projectModule.basePath}`);
  });
  console.log("");
});

process.on("SIGTERM", () => server.close());

const io = new SocketIOServer(server, {
  cors: { origin: true, credentials: true },
});

// Zeebly Admin (cap-admin-web) Socket.IO namespace
const capAdminNamespace = io.of("/cap-admin-web");
capAdminNamespace.on("connection", (socket) => {
  console.log(`[cap-admin-web] socket connected: ${socket.id}`);
  socket.on("admin-notify-all", (data: { title: string; message: string }, ack?: (response: unknown) => void) => {
    console.log(`[cap-admin-web] admin-notify-all:`, data);
    const response = {
      data: {
        title: data.title,
        message: data.message,
        admin: "zeebly-admin-1",
        admin_name: "Zeebly Admin",
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _id: `notif-${Date.now()}`,
        id: `notif-${Date.now()}`,
      },
      status: true,
      status_code: 200,
      delivered: true,
      message: "Notification sent to all users",
    };
    if (typeof ack === "function") ack(response);
    socket.broadcast.emit("new-notification", response.data);
  });
  socket.on("disconnect", () => {
    console.log(`[cap-admin-web] socket disconnected: ${socket.id}`);
  });
});

// artisan-services-web Socket.IO namespaces
const artisanChatNamespace = io.of("/artisan-services-web/chat");
artisanChatNamespace.on("connection", (socket) => {
  console.log(`[artisan-services-web/chat] socket connected: ${socket.id}`);
  socket.on("user:join", (data: { userId: string; role: string; firstname: string }) => {
    console.log(`[artisan-services-web/chat] user joined:`, data);
  });
  socket.on("message", (data: { userId: string; firstname: string; role: string; photoUrl?: string; message: string; recipient: { _id: string } }) => {
    console.log(`[artisan-services-web/chat] message:`, data);
    socket.broadcast.emit("response", {
      userId: data.userId,
      firstname: data.firstname,
      role: data.role,
      photoUrl: data.photoUrl || "",
      message: data.message,
    });
  });
  socket.on("disconnect", () => {
    console.log(`[artisan-services-web/chat] socket disconnected: ${socket.id}`);
  });
});

const artisanDisputeNamespace = io.of("/artisan-services-web/dispute");
artisanDisputeNamespace.on("connection", (socket) => {
  console.log(`[artisan-services-web/dispute] socket connected: ${socket.id}`);
  socket.on("user:join", (data: { userId: string; role: string; firstname: string; disputeId?: string }) => {
    console.log(`[artisan-services-web/dispute] user joined:`, data);
  });
  socket.on("message", (data: { userId: string; firstname: string; role: string; photoUrl?: string; message: string; recipient: { _id: string } }) => {
    console.log(`[artisan-services-web/dispute] message:`, data);
    socket.broadcast.emit("response", {
      userId: data.userId,
      firstname: data.firstname,
      role: data.role,
      photoUrl: data.photoUrl || "",
      message: data.message,
    });
  });
  socket.on("disconnect", () => {
    console.log(`[artisan-services-web/dispute] socket disconnected: ${socket.id}`);
  });
});
process.on("SIGINT", () => server.close());
