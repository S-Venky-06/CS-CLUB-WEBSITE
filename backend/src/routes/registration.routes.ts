import { Router } from "express";
import { postRegistration, getMeRegistrations } from "../controllers/index.js";
import { requireAuth } from "../middleware/index.js";
import { validate, eventRegistrationSchema } from "../validators/index.js";

const router = Router();

// Apply authentication guard globally to all registration endpoints
router.use(requireAuth);

/** POST /api/v1/registrations */
router.post("/", validate(eventRegistrationSchema), postRegistration);

/** GET /api/v1/registrations/me */
router.get("/me", getMeRegistrations);

export default router;
