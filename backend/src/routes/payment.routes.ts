import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/index.js";
import { requireAuth } from "../middleware/index.js";
import { validate } from "../validators/index.js";
import { eventRegistrationSchema } from "../validators/registration.schema.js";

const router = Router();

// Apply authentication guard globally to all payment endpoints
router.use(requireAuth);

/** POST /api/v1/payments/create-order */
router.post("/create-order", validate(eventRegistrationSchema), createOrder);

/** POST /api/v1/payments/verify */
router.post("/verify", verifyPayment);

export default router;
