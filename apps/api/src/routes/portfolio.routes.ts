import { Router } from "express";
import { getPortfolioController } from "../controllers/portfolio.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router: Router = Router();

router.get("/", asyncHandler(getPortfolioController));

export default router;
