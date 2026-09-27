import { Router } from "express";
import { getPublicAnnouncements, getFeaturedEvent, getPastEvents } from "../controllers/admin.controller.js";

const router = Router();

/** Public Announcements list */
router.get("/announcements", getPublicAnnouncements);

/** Public Featured Event details */
router.get("/events/featured", getFeaturedEvent);

/** Public Past Events list */
router.get("/events/past", getPastEvents);

export default router;
