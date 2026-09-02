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
    range: "Registrations!A2:U10000",
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
    motivation: match[5] || "",
    phone: match[6] || "",
    year: match[7] || "",
    section: match[8] || "",
    branch: match[9] || "",
    rollNumber: match[10] || "",
    projects: match[11] || "",
    linkedin: match[12] || "",
    tryhackme: match[13] || "",
    hackthebox: match[14] || "",
    otherComments: match[15] || "",
    attended: match[16] === "TRUE",
    domain: match[17] || "",
    paymentStatus: match[18] || "",
    utrNumber: match[19] || "",
    screenshotUrl: match[20] || "",
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
      registration.motivation,
      registration.phone || "",
      registration.year || "",
      registration.section || "",
      registration.branch || "",
      registration.rollNumber || "",
      registration.projects || "",
      registration.linkedin || "",
      registration.tryhackme || "",
      registration.hackthebox || "",
      registration.otherComments || "",
      "FALSE", // Attended is column Q (index 16), defaults to false
      registration.domain || "", // Domain is column R (index 17)
      registration.paymentStatus || "", // Column S
      registration.utrNumber || "", // Column T
      registration.screenshotUrl || "", // Column U
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:U2",
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
    range: "Registrations!A2:R10000",
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
      motivation: row[5] || "",
      phone: row[6] || "",
      year: row[7] || "",
      section: row[8] || "",
      branch: row[9] || "",
      rollNumber: row[10] || "",
      projects: row[11] || "",
      linkedin: row[12] || "",
      tryhackme: row[13] || "",
      hackthebox: row[14] || "",
      otherComments: row[15] || "",
      attended: row[16] === "TRUE",
      domain: row[17] || "",
      paymentStatus: row[18] || "",
      utrNumber: row[19] || "",
      screenshotUrl: row[20] || "",
    }));
}

/**
 * Retrieves all registrations in the worksheet.
 */
export async function findAllRegistrations(): Promise<Registration[]> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:U10000",
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
      motivation: row[5] || "",
      phone: row[6] || "",
      year: row[7] || "",
      section: row[8] || "",
      branch: row[9] || "",
      rollNumber: row[10] || "",
      projects: row[11] || "",
      linkedin: row[12] || "",
      tryhackme: row[13] || "",
      hackthebox: row[14] || "",
      otherComments: row[15] || "",
      attended: row[16] === "TRUE",
      domain: row[17] || "",
      paymentStatus: row[18] || "",
      utrNumber: row[19] || "",
      screenshotUrl: row[20] || "",
    }));
}

/**
 * Updates the attendance status cell for a specific registration.
 * Column Q is 'attended'.
 */
export async function updateAttendance(
  registrationId: string,
  attended: boolean,
): Promise<void> {
  const sheets = getSheetsClient();

  // 1. Fetch current rows to locate row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:Q10000",
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

  // 2. Write TRUE/FALSE back to Column Q of that row
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Registrations!Q${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[attended ? "TRUE" : "FALSE"]],
    },
  });
}

/**
 * Updates the payment status cell for a specific registration.
 * Column S is 'paymentStatus'.
 */
export async function updatePaymentStatus(
  registrationId: string,
  status: string,
): Promise<void> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Registrations!A2:S10000",
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
    range: `Registrations!S${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[status]],
    },
  });
}

