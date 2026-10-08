import { Router } from "express";
import {
  getHoldingPriceHistoryController,
  getPortfolioController,
} from "../controllers/portfolio.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router: Router = Router();

router.get("/", asyncHandler(getPortfolioController));
router.get(
  "/:holdingId/history",
  asyncHandler(getHoldingPriceHistoryController),
);

export default router;
