import type { SessionOptions } from "express-session";
import { env, isProduction } from "./environment.js";

/** Session cookie configuration for express-session */
export const sessionConfig: SessionOptions = {
  name: "sid",
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/",
  },
};
