import { Router, type Express, type Router as RouterType } from "express";
import portfolioRoutes from "./portfolio.routes.js";

const versionOneRoutes = [{ path: "/portfolio", handler: portfolioRoutes }];

/** Registers all version-one feature routes on the supplied router. */
export function mountV1Routes(router: RouterType): RouterType {
  for (const { path, handler } of versionOneRoutes) {
    router.use(path, handler);
  }

  return router;
}

/** Mounts the complete public API beneath /api. */
export function mountApiRoutes(app: Express): void {
  const apiRouter = Router();
  apiRouter.use("/v1", mountV1Routes(Router()));
  app.use("/api", apiRouter);
}
