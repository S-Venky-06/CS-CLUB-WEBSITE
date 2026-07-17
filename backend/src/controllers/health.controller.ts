import type { Request, Response } from "express";
import { sendResponse } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";

/**
 * GET /api/v1/health
 * Returns server health status.
 */
export function getHealth(_req: Request, res: Response): void {
  sendResponse(res, HttpStatus.OK, "Backend Running", {
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
