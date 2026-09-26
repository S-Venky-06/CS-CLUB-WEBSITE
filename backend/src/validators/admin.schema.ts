import { z } from "zod";

export const memberDisplaySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  visible: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});
export const memberSchema = memberDisplaySchema.extend({
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  name: z.string().trim().min(1).max(100),
  role: z.enum(["member", "admin", "super_admin"]),
});
export const attendanceSchema = z.object({
  attendedMembers: z.array(z.string().trim().min(1).max(20)).max(4)
    .refine(values => new Set(values).size === values.length, "Attendance must not contain duplicate roll numbers."),
});
export const paymentStatusSchema = z.object({ status: z.enum(["PENDING", "CONFIRMED", "SUCCESS", "FREE", "FAILED"]) });
export const announcementSchema = z.object({
  title: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1).max(2000),
  type: z.enum(["info", "warning", "urgent"]).optional(),
});
export const announcementActiveSchema = z.object({ active: z.boolean() });
export const settingsSchema = z.object({
  clubName: z.string().trim().min(1).max(100).optional(),
  clubDiscord: z.string().max(500).optional(),
  clubGithub: z.string().max(500).optional(),
  clubLinkedIn: z.string().max(500).optional(),
  registrationOpen: z.boolean().optional(),
});
