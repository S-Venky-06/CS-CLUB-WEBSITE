import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/index.js";
import { validate } from "../validators/validate.js";
import { memberSchema, memberDisplaySchema, attendanceSchema, paymentStatusSchema,
  announcementSchema, announcementActiveSchema, settingsSchema } from "../validators/admin.schema.js";
import {
  getAdminEvents,
  postAdminEvent,
  putAdminEvent,
  deleteAdminEvent,
  getAdminRegistrations,
  putAdminAttendance,
  putAdminPaymentStatus,
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
  deleteAdminAnnouncement,
  postAdminResendEmail
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
router.put("/registrations/:registrationId/attendance", validate(attendanceSchema), putAdminAttendance);
router.put("/registrations/:registrationId/payment-status", validate(paymentStatusSchema), putAdminPaymentStatus);
router.post("/registrations/:registrationId/resend-email", postAdminResendEmail);

// Member Management routes (role editing is super_admin only)
router.get("/members", getAdminMembers);
router.post("/members", requireRole("super_admin"), validate(memberSchema), postAdminMember);
router.patch("/members/:email/role", requireRole("super_admin"), patchAdminMemberRole);
router.patch("/members/:email/display", requireRole("super_admin"), validate(memberDisplaySchema), patchAdminMemberDisplay);

// Settings routes
router.get("/settings", getAdminSettings);
router.patch("/settings", validate(settingsSchema), patchAdminSettings);

// Activity Log routes
router.get("/activities", getAdminActivities);

// Announcements management routes
router.get("/announcements", getAdminAnnouncements);
router.post("/announcements", validate(announcementSchema), postAdminAnnouncement);
router.patch("/announcements/:id/active", validate(announcementActiveSchema), patchAdminAnnouncementActive);
router.delete("/announcements/:id", deleteAdminAnnouncement);


export default router;
