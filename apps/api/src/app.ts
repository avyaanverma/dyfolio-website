import express from "express";
import type { Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { pinoHttp } from "pino-http";
import { ApiResponse } from "./lib/api-response.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { mountApiRoutes } from "./routes/index.js";

export function createApp(): Express {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  app.disable("x-powered-by");
  app.use(pinoHttp({ logger, autoLogging: false }));
  app.use(morgan("dev", { stream: { write: (message) => logger.info(message.trim()) } }));
  app.use(
    cors({
      origin: frontendUrl,
    }),
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb", parameterLimit: 100 }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: new ApiResponse(429, null, "Too many requests, please try again later."),
    }),
  );

  app.get("/api/health", (req, res) => {
    res.status(200).json(new ApiResponse(200, {
      status: "ok",
      service: "dyfolio-api",
      timestamp: new Date().toISOString(),
    }));
  });

  mountApiRoutes(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
