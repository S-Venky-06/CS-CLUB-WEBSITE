import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/index.js";
import {
  getAdminEvents,
  postAdminEvent,
  putAdminEvent,
  deleteAdminEvent,
  getAdminRegistrations,
  putAdminAttendance,
  getAdminMembers,
  patchAdminMemberRole,
  patchAdminMemberDisplay,
  postAdminMember,
  getAdminSettings,
  patchAdminSettings,
  getAdminActivities,
  getAdminAnnouncements,
  postAdminAnnouncement,
  patchAdminAnnouncementActive,
  deleteAdminAnnouncement
} from "../controllers/admin.controller.js";

const router = Router();

// Apply global admin guards
router.use(requireAuth);
router.use(requireRole("admin"));

// Event CRUD routes
router.get("/events", getAdminEvents);
router.post("/events", postAdminEvent);
router.put("/events/:eventId", putAdminEvent);
router.delete("/events/:eventId", deleteAdminEvent);

// Registration routes
router.get("/registrations", getAdminRegistrations);
router.put("/registrations/:registrationId/attendance", putAdminAttendance);

// Member Management routes (role editing is super_admin only)
router.get("/members", getAdminMembers);
router.post("/members", requireRole("super_admin"), postAdminMember);
router.patch("/members/:email/role", requireRole("super_admin"), patchAdminMemberRole);
router.patch("/members/:email/display", requireRole("super_admin"), patchAdminMemberDisplay);

// Settings routes
router.get("/settings", getAdminSettings);
router.patch("/settings", patchAdminSettings);

// Activity Log routes
router.get("/activities", getAdminActivities);

// Announcements management routes
router.get("/announcements", getAdminAnnouncements);
router.post("/announcements", postAdminAnnouncement);
router.patch("/announcements/:id/active", patchAdminAnnouncementActive);
router.delete("/announcements/:id", deleteAdminAnnouncement);

export default router;
