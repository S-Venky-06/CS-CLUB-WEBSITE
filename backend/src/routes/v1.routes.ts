import { Router } from "express";
import { getHealth } from "../controllers/index.js";
import { getPublicAnnouncements, getFeaturedEvent } from "../controllers/admin.controller.js";
import authRoutes from "./auth.routes.js";
import registrationRoutes from "./registration.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

/** GET /api/v1/health */
router.get("/health", getHealth);

/** Public Announcements list */
router.get("/announcements", getPublicAnnouncements);

/** Public Featured Event details */
router.get("/events/featured", getFeaturedEvent);

/** Mount /api/v1/auth/* endpoints */
router.use("/auth", authRoutes);

/** Mount /api/v1/registrations/* endpoints */
router.use("/registrations", registrationRoutes);

/** Mount /api/v1/admin/* endpoints */
router.use("/admin", adminRoutes);

export default router;
