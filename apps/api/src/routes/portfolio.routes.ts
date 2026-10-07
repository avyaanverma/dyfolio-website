import { Router } from "express";
import { getPortfolioController } from "../controllers/portfolio.controller.js";

const router: Router = Router();

router.get("/", getPortfolioController);

export default router;
