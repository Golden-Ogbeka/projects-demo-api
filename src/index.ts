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
process.on("SIGINT", () => server.close());
