import type { Request, Response } from "express";
import { getPortfolio } from "../services/portofolio.service.js";

export async function getPortfolioController(_req: Request, res: Response) {
  try {
    const portfolio = await getPortfolio();

    res.status(200).json(portfolio);
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);

    res.status(500).json({
      message: "Failed to fetch portfolio",
    });
  }
}
