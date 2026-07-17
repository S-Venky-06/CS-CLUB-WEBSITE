import type { CorsOptions } from "cors";
import type { Options as RateLimitOptions } from "express-rate-limit";
import { env, isProduction } from "./environment.js";

/** CORS configuration */
export const corsOptions: CorsOptions = {
  origin: isProduction ? env.FRONTEND_URL : [env.FRONTEND_URL, "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/** Global rate-limiter configuration */
export const rateLimitOptions: Partial<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,               // 100 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    data: null,
  },
};

/** Morgan logging format */
export const morganFormat = isProduction ? "combined" : "dev";
