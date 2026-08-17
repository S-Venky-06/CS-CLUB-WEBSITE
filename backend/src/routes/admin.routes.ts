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
import {
  getGDResultsController,
  getRound2ShortlistController,
  postRandomizeGDTeamsController,
  postClearGDTeamsController,
  postAssignSupervisorsController,
  postGDEvaluationController,
  postShortlistRound2Controller,
  postUnshortlistRound2Controller,
} from "../controllers/index.js";

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

// Group Discussion (GD) Recruitment Panel Routes
router.get("/gd/results", getGDResultsController);
router.get("/gd/shortlist-round2", getRound2ShortlistController);
router.post("/gd/randomize", requireRole("super_admin"), postRandomizeGDTeamsController);
router.post("/gd/clear", requireRole("super_admin"), postClearGDTeamsController);
router.post("/gd/assign-supervisors", requireRole("super_admin"), postAssignSupervisorsController);
router.post("/gd/evaluate", postGDEvaluationController);
router.post("/gd/shortlist-round2", postShortlistRound2Controller);
router.post("/gd/unshortlist-round2", postUnshortlistRound2Controller);

export default router;
