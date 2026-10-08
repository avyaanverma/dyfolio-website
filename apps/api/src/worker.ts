import "dotenv/config";
import { logger } from "./lib/logger.js";
import { updateMarketData } from "./workers/market-data.worker.js";

const INTERVAL_MS = 30_000;
let running = false;

async function runUpdate() {
  if (running) {
    logger.warn(
      "Market data update skipped because the previous update is still running",
    );
    return;
  }

  running = true;
  try {
    await updateMarketData();
  } finally {
    running = false;
  }
}

void runUpdate();
const interval = setInterval(() => void runUpdate(), INTERVAL_MS);

function stopWorker() {
  clearInterval(interval);
}

process.once("SIGINT", stopWorker);
process.once("SIGTERM", stopWorker);
