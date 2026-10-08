import "dotenv/config";
import pino from "pino";

const requestedLevel = (process.env.LOG_LEVEL ?? "info").toLowerCase();
const level = requestedLevel === "dev" ? "debug" : requestedLevel;
const loggerOptions: pino.LoggerOptions = { level };

if (process.env.NODE_ENV !== "production") {
  loggerOptions.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

export const logger = pino(loggerOptions);
