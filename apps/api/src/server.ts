import express from "express";
import cors from "cors";

export function createServer() {
  const app = express();
  const PORT = 5000;

  app.use(
    cors({
      origin: "https://localhost:3000",
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

  app.listen(PORT, () => {
    console.log("Server is running on port 5000");
  });
}

createServer();