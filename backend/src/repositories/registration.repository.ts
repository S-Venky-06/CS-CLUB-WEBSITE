import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";
import type { Registration } from "../types/index.js";

/**
 * Checks if a user is already registered for a specific event.
 */
export async function findRegistration(
  eventId: string,
  email: string,
): Promise<Registration | null> {
  const sheets = getSheetsClient();
  const normalizedEmail = email.toLowerCase().trim();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:G10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return null;

  const match = rows.find(
    (row: any[]) =>
      row[1] === eventId && row[2]?.toLowerCase().trim() === normalizedEmail,
  );

  if (!match) return null;

  return {
    registrationId: match[0],
    eventId: match[1],
    email: match[2],
    name: match[3] || "",
    registeredAt: match[4] || "",
    attended: match[5] === "TRUE",
    motivation: match[6] || "",
  };
}

/**
 * Creates a new registration row in the spreadsheet.
 */
export async function createRegistration(
  registration: Omit<Registration, "attended">,
): Promise<void> {
  const sheets = getSheetsClient();

  const values = [
    [
      registration.registrationId,
      registration.eventId,
      registration.email,
      registration.name,
      registration.registeredAt,
      "FALSE", // Attended defaults to false
      registration.motivation,
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:G2",
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });
}

/**
 * Counts the total number of registrations for a specific event.
 */
export async function countRegistrationsForEvent(eventId: string): Promise<number> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!B2:B10000", // Fetch only eventId column for performance
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return 0;

  return rows.filter((row: any[]) => row[0] === eventId).length;
}

/**
 * Finds all event registrations for a given user email.
 */
export async function findRegistrationsByUser(email: string): Promise<Registration[]> {
  const sheets = getSheetsClient();
  const normalizedEmail = email.toLowerCase().trim();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:G10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[2]?.toLowerCase().trim() === normalizedEmail)
    .map((row: any[]) => ({
      registrationId: row[0],
      eventId: row[1],
      email: row[2],
      name: row[3] || "",
      registeredAt: row[4] || "",
      attended: row[5] === "TRUE",
      motivation: row[6] || "",
    }));
}

/**
 * Retrieves all registrations in the worksheet.
 */
export async function findAllRegistrations(): Promise<Registration[]> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:G10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[0]) // Filter out empty rows
    .map((row: any[]) => ({
      registrationId: row[0],
      eventId: row[1],
      email: row[2],
      name: row[3] || "",
      registeredAt: row[4] || "",
      attended: row[5] === "TRUE",
      motivation: row[6] || "",
    }));
}

/**
 * Updates the attendance status cell for a specific registration.
 */
export async function updateAttendance(
  registrationId: string,
  attended: boolean,
): Promise<void> {
  const sheets = getSheetsClient();

  // 1. Fetch current rows to locate row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:G10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error("Registration not found.");
  }

  const index = rows.findIndex((row: any[]) => row[0] === registrationId);
  if (index === -1) {
    throw new Error("Registration not found.");
  }

  const rowIndex = index + 2; // Range A2 starts at index 0, so target row is index + 2

  // 2. Write TRUE/FALSE back to Column F of that row
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Registrations!F${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[attended ? "TRUE" : "FALSE"]],
    },
  });
}
