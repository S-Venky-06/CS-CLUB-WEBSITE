import { findEventById, findAllEvents } from "../repositories/index.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { Event } from "../types/index.js";

/**
 * Retrieves a single event by ID. Throws 404 if not found.
 */
export async function getEventDetails(eventId: string): Promise<Event> {
  const event = await findEventById(eventId);
  if (!event) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Event not found.");
  }
  return event;
}

/**
 * Retrieves all events.
 */
export async function getEventsList(): Promise<Event[]> {
  return findAllEvents();
}
