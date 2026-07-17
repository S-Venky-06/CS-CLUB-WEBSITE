import type { Request, Response } from "express";
import { 
  findAllEvents, 
  findEventById, 
  createEvent as saveEvent, 
  updateEvent as editEvent,
  deleteEvent as removeEvent 
} from "../repositories/event.repository.js";
import {
  findAllRegistrations,
  updateAttendance
} from "../repositories/registration.repository.js";
import { eventSchema } from "../validators/event.schema.js";
import { sendResponse, asyncHandler, ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import { getSheetsClient } from "../repositories/googleSheets.client.js";
import { env } from "../config/index.js";
import {
  findAllMembers,
  updateMemberRole,
  updateMemberDisplay,
  findMemberByEmail
} from "../repositories/member.repository.js";
import {
  findSettings,
  updateSetting
} from "../repositories/settings.repository.js";
import {
  logActivity,
  findAllActivities
} from "../repositories/activity.repository.js";
import {
  findAllAnnouncements,
  createAnnouncement,
  toggleAnnouncementActive,
  deleteAnnouncement,
  findActiveAnnouncements
} from "../repositories/announcement.repository.js";

/**
 * GET /api/v1/admin/events
 * Retrieves all events (including cancelled & completed) for admin overview.
 */
export const getAdminEvents = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const events = await findAllEvents();
    sendResponse(res, HttpStatus.OK, "Events retrieved successfully.", events);
  },
);

/**
 * POST /api/v1/admin/events
 * Creates a new event.
 */
export const postAdminEvent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // 1. Validate payload inputs
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        parsed.error.errors[0]?.message || "Invalid input parameters.",
      );
    }

    const { eventId, title, description, date, capacity, deadline, status } = parsed.data;

    // 2. Check duplicate Event ID
    const existing = await findEventById(eventId);
    if (existing) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        `An event with ID '${eventId}' already exists.`,
      );
    }

    // 3. Save to Google Sheets
    await saveEvent({
      eventId,
      title,
      description,
      date,
      capacity,
      deadline,
      status,
    });

    await logActivity(req.session.user!.email, "CREATE_EVENT", `Created event: ${title} (${eventId})`);

    sendResponse(
      res,
      HttpStatus.CREATED,
      "Event created successfully.",
      parsed.data,
    );
  },
);

/**
 * PUT /api/v1/admin/events/:eventId
 * Updates details of an existing event.
 */
export const putAdminEvent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params as { eventId: string };
    if (!eventId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "eventId parameter is required.");
    }

    // 1. Verify existence
    const event = await findEventById(eventId);
    if (!event) {
      throw new ApiError(HttpStatus.NOT_FOUND, "The requested event was not found.");
    }

    // 2. Validate update parameters
    const parsed = eventSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        parsed.error.errors[0]?.message || "Invalid input parameters.",
      );
    }

    // 3. Save updates to Google Sheets
    await editEvent(eventId, parsed.data);

    await logActivity(req.session.user!.email, "UPDATE_EVENT", `Updated details for event: ${event.title} (${eventId})`);

    sendResponse(
      res,
      HttpStatus.OK,
      "Event updated successfully.",
      { eventId, ...parsed.data },
    );
  },
);

/**
 * DELETE /api/v1/admin/events/:eventId
 * Archives/cancels an event.
 */
export const deleteAdminEvent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params as { eventId: string };
    if (!eventId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "eventId parameter is required.");
    }

    // 1. Verify existence
    const event = await findEventById(eventId);
    if (!event) {
      throw new ApiError(HttpStatus.NOT_FOUND, "The requested event was not found.");
    }

    // 2. Cancel/Archive
    await removeEvent(eventId);

    await logActivity(req.session.user!.email, "DELETE_EVENT", `Deleted event with ID: ${eventId}`);

    sendResponse(
      res,
      HttpStatus.OK,
      "Event archived/cancelled successfully.",
      { eventId },
    );
  },
);

/**
 * GET /api/v1/admin/registrations
 * Retrieves all event registrations.
 */
export const getAdminRegistrations = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const registrations = await findAllRegistrations();
    sendResponse(res, HttpStatus.OK, "Registrations retrieved successfully.", registrations);
  },
);

/**
 * PUT /api/v1/admin/registrations/:registrationId/attendance
 * Toggles attendance for a student registration.
 */
export const putAdminAttendance = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { registrationId } = req.params as { registrationId: string };
    const { attended } = req.body;

    if (!registrationId || attended === undefined) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "registrationId and attended status are required.");
    }

    await updateAttendance(registrationId, !!attended);

    await logActivity(req.session.user!.email, "TOGGLE_ATTENDANCE", `Toggled attendance status to ${attended ? "PRESENT" : "ABSENT"} for registration ${registrationId}`);

    sendResponse(res, HttpStatus.OK, "Attendance updated successfully.", {
      registrationId,
      attended: !!attended,
    });
  },
);

/**
 * GET /api/v1/admin/members
 * Retrieves all club members and roles.
 */
export const getAdminMembers = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const members = await findAllMembers();
    sendResponse(res, HttpStatus.OK, "Members retrieved successfully.", members);
  },
);

/**
 * PATCH /api/v1/admin/members/:email/role
 * Assigns new role to a member. Super Admin only.
 */
export const patchAdminMemberRole = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.params as { email: string };
    const { role } = req.body;

    if (!email || !role) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "email and role parameters are required.");
    }

    if (role !== "member" && role !== "admin" && role !== "super_admin") {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid role parameter specified.");
    }

    const callerEmail = req.session.user?.email?.toLowerCase().trim();
    const targetEmail = email.toLowerCase().trim();

    // 1. Self-action guard
    if (callerEmail === targetEmail) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "You cannot modify your own administrative role.");
    }

    // 2. Environment seed protection guard
    if (env.SUPER_ADMIN_EMAILS.includes(targetEmail) || env.ADMIN_EMAILS.includes(targetEmail)) {
      throw new ApiError(
        HttpStatus.FORBIDDEN,
        "Cannot modify roles for seed administrators defined in environment variables.",
      );
    }

    await updateMemberRole(targetEmail, role);

    await logActivity(callerEmail!, "UPDATE_ROLE", `Promoted/demoted member ${targetEmail} to role ${role}`);

    sendResponse(res, HttpStatus.OK, `Member role updated to ${role} successfully.`, {
      email: targetEmail,
      role,
    });
  },
);

/**
 * PATCH /api/v1/admin/members/:email/display
 * Updates name, visibility, and order of a member.
 */
export const patchAdminMemberDisplay = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.params as { email: string };
    const { name, visible, displayOrder } = req.body;

    if (!email) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "email parameter is required.");
    }

    const targetEmail = email.toLowerCase().trim();

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (visible !== undefined) updates.visible = !!visible;
    if (displayOrder !== undefined) updates.displayOrder = parseInt(displayOrder, 10);

    await updateMemberDisplay(targetEmail, updates);

    await logActivity(req.session.user!.email, "UPDATE_MEMBER_DISPLAY", `Updated roster display values for ${targetEmail}`);

    sendResponse(res, HttpStatus.OK, "Member display settings updated successfully.", {
      email: targetEmail,
      ...updates,
    });
  },
);

/**
 * POST /api/v1/admin/members
 * Creates a new member row in the Members worksheet.
 */
export const postAdminMember = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, name, role, visible, displayOrder } = req.body;

    if (!email || !name || !role) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "email, name, and role are required.");
    }

    const targetEmail = email.toLowerCase().trim();

    // 1. Verify existence
    const existing = await findMemberByEmail(targetEmail);
    if (existing) {
      throw new ApiError(HttpStatus.CONFLICT, `Member with email ${targetEmail} already exists.`);
    }

    // 2. Append new row to Google Sheets
    const sheets = getSheetsClient();
    const values = [
      [
        targetEmail,
        name,
        role,
        visible === false ? "FALSE" : "TRUE",
        String(displayOrder !== undefined ? displayOrder : 0),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Members!A2:E2",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    await logActivity(req.session.user!.email, "ADD_MEMBER", `Manually added roster operator: ${name} (${targetEmail}) with role ${role}`);

    sendResponse(res, HttpStatus.CREATED, "Member added successfully.", {
      email: targetEmail,
      name,
      role,
      visible: visible !== false,
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
    });
  },
);

/**
 * GET /api/v1/admin/settings
 * Retrieves club settings, system info, and API connection status.
 */
export const getAdminSettings = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    let connectionStatus = "healthy";
    try {
      const sheets = getSheetsClient();
      await sheets.spreadsheets.get({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      });
    } catch (err: any) {
      console.error("Connection check failed:", err.message || err);
      connectionStatus = "unreachable";
    }

    const settings = await findSettings();

    sendResponse(res, HttpStatus.OK, "Settings retrieved successfully.", {
      settings,
      system: {
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        adminEmails: env.ADMIN_EMAILS,
        superAdminEmails: env.SUPER_ADMIN_EMAILS,
        connectionStatus,
      },
    });
  },
);

/**
 * PATCH /api/v1/admin/settings
 * Updates club settings.
 */
export const patchAdminSettings = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { clubName, clubDiscord, clubGithub, clubLinkedIn, registrationOpen } = req.body;

    if (clubName !== undefined) await updateSetting("clubName", clubName);
    if (clubDiscord !== undefined) await updateSetting("clubDiscord", clubDiscord);
    if (clubGithub !== undefined) await updateSetting("clubGithub", clubGithub);
    if (clubLinkedIn !== undefined) await updateSetting("clubLinkedIn", clubLinkedIn);
    if (registrationOpen !== undefined) {
      await updateSetting("registrationOpen", registrationOpen ? "TRUE" : "FALSE");
    }

    await logActivity(req.session.user!.email, "UPDATE_SETTINGS", "Updated global club settings & configurations");

    const updated = await findSettings();

    sendResponse(res, HttpStatus.OK, "Settings updated successfully.", updated);
  },
);

/**
 * GET /api/v1/admin/activities
 * Retrieves reverse-chronological logs list.
 */
export const getAdminActivities = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const logs = await findAllActivities();
    sendResponse(res, HttpStatus.OK, "Activities retrieved successfully.", logs);
  },
);

/**
 * GET /api/v1/admin/announcements
 * Lists all announcements.
 */
export const getAdminAnnouncements = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const items = await findAllAnnouncements();
    sendResponse(res, HttpStatus.OK, "Announcements retrieved successfully.", items);
  },
);

/**
 * POST /api/v1/admin/announcements
 * Creates a new announcement banner.
 */
export const postAdminAnnouncement = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { message } = req.body;
    if (!message || !message.trim()) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "message is required.");
    }

    const item = await createAnnouncement(message.trim());
    await logActivity(req.session.user!.email, "CREATE_ANNOUNCEMENT", `Published broadcast banner: "${message.trim()}"`);

    sendResponse(res, HttpStatus.CREATED, "Announcement published successfully.", item);
  },
);

/**
 * PATCH /api/v1/admin/announcements/:id/active
 * Toggles an announcement's active status.
 */
export const patchAdminAnnouncementActive = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { active } = req.body;

    if (!id || active === undefined) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "announcement id and active status are required.");
    }

    await toggleAnnouncementActive(id, !!active);
    await logActivity(req.session.user!.email, "TOGGLE_ANNOUNCEMENT", `Toggled status of announcement ${id} to ${active ? "ACTIVE" : "ARCHIVED"}`);

    sendResponse(res, HttpStatus.OK, "Announcement status updated successfully.", { id, active: !!active });
  },
);

/**
 * DELETE /api/v1/admin/announcements/:id
 * Deletes an announcement.
 */
export const deleteAdminAnnouncement = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    if (!id) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "announcement id is required.");
    }

    await deleteAnnouncement(id);
    await logActivity(req.session.user!.email, "DELETE_ANNOUNCEMENT", `Deleted announcement with ID: ${id}`);

    sendResponse(res, HttpStatus.OK, "Announcement deleted successfully.", { id });
  },
);

/**
 * GET /api/v1/announcements (Public)
 * Lists all active public announcements.
 */
export const getPublicAnnouncements = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const items = await findActiveAnnouncements();
    sendResponse(res, HttpStatus.OK, "Active announcements retrieved successfully.", items);
  },
);

/**
 * GET /api/v1/events/featured (Public)
 * Retrieves details of the featured live event (ID: evt-01).
 */
export const getFeaturedEvent = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const event = await findEventById("evt-01");
    if (!event) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Featured event was not configured in Google Sheets.");
    }
    sendResponse(res, HttpStatus.OK, "Featured event details retrieved successfully.", event);
  },
);

