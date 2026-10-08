import { createApp } from "./app.js";
import "dotenv/config";
import { logger } from "./lib/logger.js";

export function createServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Server is running");
  });
}

createServer();
