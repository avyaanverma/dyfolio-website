import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../lib/api-error.js";
import { ApiResponse } from "../lib/api-response.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message =
    error instanceof ApiError ? error.message : "An unexpected error occurred";

  if (statusCode >= 500) {
    req.log.error({ err: error, statusCode }, "Request failed");
  } else {
    req.log.warn(
      { statusCode, method: req.method, path: req.originalUrl },
      message,
    );
  }
  res.status(statusCode).json(
    new ApiResponse(statusCode, null, message),
  );
};
