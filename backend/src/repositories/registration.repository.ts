import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";
import { parseRegistrationRow } from "./registrationRow.js";
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
    range: "Registrations!A2:Q10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return null;

  const match = rows.find(
    (row: any[]) =>
      row[1] === eventId && row[2]?.toLowerCase().trim() === normalizedEmail,
  );

  if (!match) return null;

  return parseRegistrationRow(match);
}

/**
 * Creates a new registration row in the spreadsheet.
 */
export async function createRegistration(
  registration: Omit<Registration, "attendedMembers">,
): Promise<void> {
  const sheets = getSheetsClient();

  const values = [
    [
      registration.registrationId,
      registration.eventId,
      registration.email,
      registration.name,
      registration.registeredAt,
      registration.phone || "",
      registration.year || "",
      registration.section || "",
      registration.branch || "",
      registration.rollNumber || "",
      registration.otherComments || "",
      "[]", // Attended is column L (index 11)
      registration.paymentStatus || "", // Column M
      registration.transactionId || "", // Column N
      String(registration.teamSize || 1), // Column O
      registration.teamMembers && registration.teamMembers.length > 0 ? JSON.stringify(registration.teamMembers) : "", // Column P
      registration.emailStatus || "", // Column Q
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:Q2",
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
    range: "Registrations!A2:Q10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[2]?.toLowerCase().trim() === normalizedEmail)
    .map(parseRegistrationRow);
}

/**
 * Retrieves all registrations in the worksheet.
 */
export async function findAllRegistrations(): Promise<Registration[]> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:Q10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[0]) // Filter out empty rows
    .map(parseRegistrationRow);
}

/**
 * Updates the attendance status cell for a specific registration.
 * Column L is 'attended'.
 */
export async function updateAttendance(
  registrationId: string,
  attendedMembers: string[],
): Promise<void> {
  const sheets = getSheetsClient();

  // 1. Fetch current rows to locate row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:L10000",
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

  // 2. Write member roll numbers back to Column L of that row
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Registrations!L${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[JSON.stringify(attendedMembers)]],
    },
  });
}

/**
 * Updates the payment status cell for a specific registration.
 * Column M is 'paymentStatus'.
 */
export async function updatePaymentStatus(
  registrationId: string,
  status: string,
  transactionId?: string
): Promise<void> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:M10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error("Registration not found.");
  }

  const index = rows.findIndex((row: any[]) => row[0] === registrationId);
  if (index === -1) {
    throw new Error("Registration not found.");
  }

  const rowIndex = index + 2; 

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: transactionId ? `Registrations!M${rowIndex}:N${rowIndex}` : `Registrations!M${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: transactionId ? [[status, transactionId]] : [[status]],
    },
  });
}

/**
 * Updates the email status cell for a specific registration.
 * Column Q is 'emailStatus'.
 */
export async function updateEmailStatus(
  registrationId: string,
  status: string,
): Promise<void> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:A10000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error("Registration not found.");
  }

  const index = rows.findIndex((row: any[]) => row[0] === registrationId);
  if (index === -1) {
    throw new Error("Registration not found.");
  }

  const rowIndex = index + 2; 

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Registrations!Q${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[status]],
    },
  });
}

