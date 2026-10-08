import type { Request, Response } from "express";
import { ApiResponse } from "../lib/api-response.js";
import { getPortfolio } from "../services/portofolio.service.js";

export async function getPortfolioController(_req: Request, res: Response) {
  const portfolio = await getPortfolio();
  res.status(200).json(new ApiResponse(200, portfolio));
}
