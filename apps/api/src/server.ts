import { createApp } from "./app.js";
import "dotenv/config";

export function createServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

createServer();
