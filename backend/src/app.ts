import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import session from "express-session";

import { corsOptions, rateLimitOptions, morganFormat, sessionConfig } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Trust proxy header for reverse proxies (like localtunnel / Render)
app.set("trust proxy", 1);

// ─── Security ────────────────────────────────────
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimit(rateLimitOptions));

// ─── Parsing & Sessions ──────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(session(sessionConfig));

// ─── Token Authentication Parser Middleware ─────────
import { verifyToken } from "./utils/index.js";
app.use((req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decodedUser = verifyToken(token);
    if (decodedUser) {
      if (!req.session) {
        req.session = { user: decodedUser } as any;
      } else {
        req.session.user = decodedUser;
      }
    }
  }
  next();
});

// ─── Performance ─────────────────────────────────
app.use(compression());

// ─── Logging ─────────────────────────────────────
app.use(morgan(morganFormat));

// ─── Routes ──────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Error Handling ──────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
