import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";
import type { Member, UserRole } from "../types/index.js";

/**
 * Finds a member in the database by email.
 */
export async function findMemberByEmail(email: string): Promise<Member | null> {
  const sheets = getSheetsClient();
  const normalizedEmail = email.toLowerCase().trim();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Members!A2:E1000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return null;

  const match = rows.find(
    (row: any[]) => row[0]?.toLowerCase().trim() === normalizedEmail,
  );
  if (!match) return null;

  return {
    email: match[0],
    name: match[1] || "",
    role: (match[2] || "member") as UserRole,
    visible: match[3] === "TRUE",
    displayOrder: parseInt(match[4] || "0", 10),
  };
}

/**
 * Retrieves all members from the worksheet.
 */
export async function findAllMembers(): Promise<Member[]> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Members!A2:E1000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any[]) => row[0]) // Filter empty rows
    .map((row: any[]) => ({
      email: row[0],
      name: row[1] || "",
      role: (row[2] || "member") as UserRole,
      visible: row[3] === "TRUE",
      displayOrder: parseInt(row[4] || "0", 10),
    }));
}

/**
 * Updates or sets the role of a member. Appends a new row if they do not exist.
 */
export async function updateMemberRole(email: string, role: UserRole): Promise<void> {
  const sheets = getSheetsClient();
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Fetch current rows to locate row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Members!A2:E1000",
  });

  const rows = response.data.values || [];
  const index = rows.findIndex(
    (row: any[]) => row[0]?.toLowerCase().trim() === normalizedEmail,
  );

  if (index === -1) {
    // 2. Append new row if they don't exist
    const values = [
      [
        normalizedEmail,
        normalizedEmail.split("@")[0] || "", // Placeholder name from email prefix
        role,
        "TRUE",
        "0",
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
  } else {
    // 3. Update existing role cell (Column C, index 2)
    const rowIndex = index + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: `Members!C${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[role]],
      },
    });
  }
}

/**
 * Updates visibility and order of a member.
 */
export async function updateMemberDisplay(
  email: string,
  updates: Partial<Pick<Member, "name" | "visible" | "displayOrder">>,
): Promise<void> {
  const sheets = getSheetsClient();
  const normalizedEmail = email.toLowerCase().trim();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Members!A2:E1000",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error("Member not found.");
  }

  const index = rows.findIndex(
    (row: any[]) => row[0]?.toLowerCase().trim() === normalizedEmail,
  );

  if (index === -1) {
    throw new Error("Member not found.");
  }

  const rowIndex = index + 2;
  const match = rows[index];

  const updatedRow = [
    normalizedEmail,
    updates.name !== undefined ? updates.name : (match[1] || ""),
    match[2] || "member", // Maintain existing role
    updates.visible !== undefined ? (updates.visible ? "TRUE" : "FALSE") : (match[3] || "TRUE"),
    updates.displayOrder !== undefined ? String(updates.displayOrder) : (match[4] || "0"),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Members!A${rowIndex}:E${rowIndex}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [updatedRow],
    },
  });
}
