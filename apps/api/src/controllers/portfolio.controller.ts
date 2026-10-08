import type { Request, Response } from "express";
import { ApiError } from "../lib/api-error.js";
import { ApiResponse } from "../lib/api-response.js";
import { getPriceHistory } from "../repositories/price-history.repository.js";
import { getStockIdForHolding } from "../repositories/portfolio.repository.js";
import { getPortfolio } from "../services/portofolio.service.js";

export async function getPortfolioController(_req: Request, res: Response) {
  const portfolio = await getPortfolio();
  res.status(200).json(new ApiResponse(200, portfolio));
}

export async function getHoldingPriceHistoryController(
  req: Request,
  res: Response,
) {
  const holdingId = Number(req.params.holdingId);

  if (!Number.isInteger(holdingId) || holdingId < 1) {
    throw new ApiError(400, "A valid holding id is required");
  }

  const stockId = await getStockIdForHolding(holdingId);

  if (stockId === null) {
    throw new ApiError(404, "Holding not found");
  }

  const history = await getPriceHistory(stockId);
  res.status(200).json(new ApiResponse(200, history));
}
