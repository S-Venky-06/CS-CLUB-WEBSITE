import express, { Router } from "express";
import { cashfreeWebhook } from "../controllers/index.js";

const router = Router();

// Webhooks require the raw request body to cryptographically verify signatures.
// express.raw() parses the incoming body as a Buffer.
router.post(
  "/cashfree",
  express.raw({ type: "application/json" }),
  cashfreeWebhook
);

export default router;
