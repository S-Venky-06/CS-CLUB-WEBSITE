import { Router } from "express";
import rateLimit from "express-rate-limit";
import { googleLogin, getMe, logout } from "../controllers/index.js";
import { requireAuth } from "../middleware/index.js";
import { validate, googleLoginSchema } from "../validators/index.js";

const router = Router();

/**
 * Scoped rate limiter for authentication routes:
 * Limits auth attempts to 10 requests per 1 minute per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,           // 10 requests
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in a minute.",
    data: null,
  },
});

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

/** POST /api/v1/auth/google */
router.post("/google", validate(googleLoginSchema), googleLogin);

/** GET /api/v1/auth/me */
router.get("/me", requireAuth, getMe);

/** POST /api/v1/auth/logout */
router.post("/logout", requireAuth, logout);

export default router;
