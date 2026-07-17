import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";
import type { Event } from "../types/index.js";

/**
 * Finds an event by its unique ID.
 * @param eventId The event identifier
 * @returns The Event object or null if not found
 */
export async function findEventById(eventId: string): Promise<Event | null> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Events!A2:G500",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return null;

  const match = rows.find((row: any[]) => row[0] === eventId);
  if (!match) return null;

  return {
    eventId: match[0],
    title: match[1] || "",
    description: match[2] || "",
    date: match[3] || "",
    capacity: parseInt(match[4] || "0", 10),
    deadline: match[5] || "",
    status: (match[6] || "active") as "active" | "cancelled" | "completed",
  };
}

/**
 * Retrieves all events defined in the worksheet.
 */
export async function findAllEvents(): Promise<Event[]> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Events!A2:G500",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[0]) // Filter out empty rows
    .map((row: any[]) => ({
      eventId: row[0],
      title: row[1] || "",
      description: row[2] || "",
      date: row[3] || "",
      capacity: parseInt(row[4] || "0", 10),
      deadline: row[5] || "",
      status: (row[6] || "active") as "active" | "cancelled" | "completed",
    }));
}

/**
 * Creates a new event row in the Events worksheet.
 */
export async function createEvent(event: Event): Promise<void> {
  const sheets = getSheetsClient();

  const values = [
    [
      event.eventId,
      event.title,
      event.description,
      event.date,
      String(event.capacity),
      event.deadline,
      event.status,
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Events!A2:G2",
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });
}

/**
 * Updates columns for an existing event row in the worksheet.
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<Event>,
): Promise<void> {
  const sheets = getSheetsClient();

  // 1. Fetch current rows to locate row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Events!A2:G500",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error("Event not found.");
  }

  const index = rows.findIndex((row: any[]) => row[0] === eventId);
  if (index === -1) {
    throw new Error("Event not found.");
  }

  const rowIndex = index + 2; // Range A2 starts at index 0, so target is row index + 2
  const match = rows[index];

  // 2. Map updated values
  const updatedRow = [
    eventId,
    updates.title !== undefined ? updates.title : (match[1] || ""),
    updates.description !== undefined ? updates.description : (match[2] || ""),
    updates.date !== undefined ? updates.date : (match[3] || ""),
    updates.capacity !== undefined ? String(updates.capacity) : (match[4] || "0"),
    updates.deadline !== undefined ? updates.deadline : (match[5] || ""),
    updates.status !== undefined ? updates.status : (match[6] || "active"),
  ];

  // 3. Write back to the targeted row
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Events!A${rowIndex}:G${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [updatedRow],
    },
  });
}

/**
 * Deletes/Archives an event by changing its status to cancelled.
 */
export async function deleteEvent(eventId: string): Promise<void> {
  await updateEvent(eventId, { status: "cancelled" });
}
