import {
  createRegistration,
  findAllRegistrations,
  findRegistrationsByUser,
} from "../repositories/index.js";
import { getEventDetails } from "./event.service.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { Registration } from "../types/index.js";
import type { TeamMember } from "../types/event.js";
import { findSettings } from "../repositories/settings.repository.js";

/**
 * Registers a user for a specific event after performing business rule validations.
 */
export async function registerForEvent(
  eventId: string,
  email: string,
  name: string,
  motivation: string,
  phone: string,
  year: string,
  section: string,
  branch: string,
  rollNumber: string,
  projects?: string,
  linkedin?: string,
  tryhackme?: string,
  hackthebox?: string,
  otherComments?: string,
  teamSize = 1,
  teamMembers: TeamMember[] = [],
): Promise<Omit<Registration, "attendedMembers">> {
  // 1. Check if event exists (throws 404 if not)
  const event = await getEventDetails(eventId);
  if (!(await findSettings()).registrationOpen) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Registrations are currently closed.");
  }
  if (event.price !== 0) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Use the payment checkout to register for a paid event.");
  }

  // 2. Validate event status is active
  if (event.status !== "active") {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Registrations are not active for this event.",
    );
  }

  // 3. Validate deadline
  const now = new Date();
  const deadlineDate = new Date(event.deadline);
  if (!Number.isFinite(deadlineDate.getTime()) || now >= deadlineDate) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Registration deadline for this event has passed.",
    );
  }

  // 4. Fetch all registrations once to optimize Sheets API read requests
  const allRegistrations = await findAllRegistrations();

  // 5. Check for duplicate registration
  const normalizedEmail = email.toLowerCase().trim();
  const existing = allRegistrations.find(
    (reg: Registration) =>
      reg.eventId === eventId && reg.email.toLowerCase().trim() === normalizedEmail,
  );
  if (existing) {
    throw new ApiError(
      HttpStatus.CONFLICT,
      "You have already registered for this event.",
    );
  }

  // 6. Check capacity limits
  const currentCapacity = allRegistrations.filter((reg: Registration) => reg.eventId === eventId).length;
  if (currentCapacity >= event.capacity) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "This event is at full capacity.",
    );
  }

  // 6. Generate registration details
  const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  const registrationId = `REG-${eventId.toUpperCase()}-${randomSuffix}`;
  const registeredAt = new Date().toISOString();

  const newRegistration = {
    registrationId,
    eventId,
    email: normalizedEmail,
    name,
    registeredAt,
    motivation,
    phone,
    year,
    section,
    branch,
    rollNumber,
    projects: projects || "",
    linkedin: linkedin || "",
    tryhackme: tryhackme || "",
    hackthebox: hackthebox || "",
    otherComments: otherComments || "",
    teamSize,
    teamMembers,
    paymentStatus: "FREE",
  };

  // 7. Write to storage (Google Sheets)
  await createRegistration(newRegistration);

  return newRegistration;
}

/**
 * Fetches all registrations associated with a specific user email.
 */
export async function getUserRegistrations(email: string): Promise<Registration[]> {
  return findRegistrationsByUser(email);
}
