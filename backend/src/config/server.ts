import type { CorsOptions } from "cors";
import type { Options as RateLimitOptions } from "express-rate-limit";
import { env, isProduction } from "./environment.js";

/** Parse allowed origins from FRONTEND_URL */
const getAllowedOrigins = (): string[] => {
  const list = (env.FRONTEND_URL || "")
    .split(",")
    .map((u) => u.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (!isProduction) {
    if (!list.includes("http://localhost:3000")) list.push("http://localhost:3000");
    if (!list.includes("http://127.0.0.1:3000")) list.push("http://127.0.0.1:3000");
  }
  return list;
};

/** CORS configuration */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser or same-origin requests
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");
    const allowed = getAllowedOrigins();

    const isMatch =
      allowed.includes(cleanOrigin) ||
      (!isProduction && cleanOrigin.startsWith("http://localhost:")) ||
      (env.FRONTEND_URL.includes("vercel.app") && cleanOrigin.endsWith(".vercel.app"));

    if (isMatch) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
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

