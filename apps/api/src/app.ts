import express from "express";
import type { Express } from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolio.routes.js";

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
    }),
  );

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "dyfolio-api",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/portfolio", portfolioRoutes);

  return app;
}
