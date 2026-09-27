import { Router } from "express";
import v1Routes from "./v1.routes.js";

const router = Router();

router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  next();
});

/** Mount versioned API routes */
router.use("/v1", v1Routes);

export default router;
