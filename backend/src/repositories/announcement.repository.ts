import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";

export interface Announcement {
  announcementId: string;
  message: string;
  active: boolean;
  createdAt: string;
}

export async function findActiveAnnouncements(): Promise<Announcement[]> {
  const sheets = getSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Announcements!A2:D1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const items: Announcement[] = rows
      .map((row: any) => ({
        announcementId: row[0] || "",
        message: row[1] || "",
        active: row[2] === "TRUE",
        createdAt: row[3] || "",
      }))
      .filter((item: Announcement) => item.announcementId && item.active);

    // Sort newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.warn("Failed to fetch active announcements (tab probably missing):", error.message || error);
    return [];
  }
}

export async function findAllAnnouncements(): Promise<Announcement[]> {
  const sheets = getSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Announcements!A2:D1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const items: Announcement[] = rows
      .map((row: any) => ({
        announcementId: row[0] || "",
        message: row[1] || "",
        active: row[2] === "TRUE",
        createdAt: row[3] || "",
      }))
      .filter((item: Announcement) => item.announcementId);

    // Sort newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.warn("Failed to fetch all announcements (tab probably missing):", error.message || error);
    return [];
  }
}

export async function createAnnouncement(message: string): Promise<Announcement> {
  const sheets = getSheetsClient();
  const id = `ANN-${Date.now()}`;
  const timestamp = new Date().toISOString();

  // 1. Verify / bootstrap Announcements sheet tab if missing
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Announcements!A2:D2",
    });
  } catch (err: any) {
    console.log("Announcements tab missing. Attempting to bootstrap Announcements worksheet...");
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Announcements",
                },
              },
            },
          ],
        },
      });
      // Write headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        range: "Announcements!A1:D1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["announcementId", "message", "active", "createdAt"]],
        },
      });
    } catch (bootstrapErr: any) {
      console.error("Failed to bootstrap Announcements tab:", bootstrapErr.message || bootstrapErr);
      throw bootstrapErr;
    }
  }

  // 2. Append new announcement row
  const values = [[id, message, "TRUE", timestamp]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Announcements!A2:D2",
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });

  return {
    announcementId: id,
    message,
    active: true,
    createdAt: timestamp,
  };
}

export async function toggleAnnouncementActive(id: string, active: boolean): Promise<void> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Announcements!A2:A1000",
  });

  const rows = response.data.values || [];
  const index = rows.findIndex((row: any) => row[0] && row[0].trim() === id);

  if (index !== -1) {
    const rowNumber = index + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: `Announcements!C${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[active ? "TRUE" : "FALSE"]],
      },
    });
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Announcements!A2:A1000",
  });

  const rows = response.data.values || [];
  const index = rows.findIndex((row: any) => row[0] && row[0].trim() === id);

  if (index !== -1) {
    const rowNumber = index + 2;
    // Clear values of the matching row
    await sheets.spreadsheets.values.clear({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: `Announcements!A${rowNumber}:D${rowNumber}`,
    });
  }
}
