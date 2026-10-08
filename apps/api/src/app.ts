import express from "express";
import type { Express } from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolio.routes.js";

export function createApp(): Express {
  const app = express();

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

  app.use(
    cors({
      origin: frontendUrl,
    }),
  );

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "dyfolio-api",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/portfolio", portfolioRoutes);

  return app;
}
