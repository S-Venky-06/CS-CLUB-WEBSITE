import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/index.js";
import { requireAuth } from "../middleware/index.js";
import { validate } from "../validators/index.js";
import { eventRegistrationSchema } from "../validators/registration.schema.js";

import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Apply authentication guard globally to all payment endpoints
router.use(requireAuth);

/** POST /api/v1/payments/create-order */
router.post("/create-order", validate(eventRegistrationSchema), createOrder);

/** POST /api/v1/payments/submit-utr */
// Note: We don't use 'validate(verifyPaymentSchema)' here as middleware because 
// the data is multipart/form-data, not a JSON body. Validation happens in the controller.
router.post("/submit-utr", upload.single("screenshot"), verifyPayment);

export default router;
