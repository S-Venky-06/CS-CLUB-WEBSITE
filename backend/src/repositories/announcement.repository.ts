import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";

export interface Announcement {
  announcementId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "urgent";
  active: boolean;
  createdAt: string;
}

export async function findActiveAnnouncements(): Promise<Announcement[]> {
  const sheets = getSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Announcements!A2:F1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const items: Announcement[] = rows
      .map((row: any) => {
        // Support both old 4-column schema [id, msg, active, createdAt] 
        // and new 6-column schema [id, title, msg, type, active, createdAt]
        const has6Cols = row.length >= 6 || (row[3] === "info" || row[3] === "warning" || row[3] === "urgent");
        return {
          announcementId: row[0] || "",
          title: has6Cols ? (row[1] || "Announcement") : "Announcement",
          message: has6Cols ? (row[2] || "") : (row[1] || ""),
          type: (has6Cols ? row[3] : "info") as "info" | "warning" | "urgent",
          active: (has6Cols ? row[4] : row[2]) === "TRUE",
          createdAt: (has6Cols ? row[5] : row[3]) || "",
        };
      })
      .filter((item: Announcement) => item.announcementId && item.active);

    // Sort newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.warn("Failed to fetch active announcements:", error.message || error);
    return [];
  }
}

export async function findAllAnnouncements(): Promise<Announcement[]> {
  const sheets = getSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Announcements!A2:F1000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const items: Announcement[] = rows
      .map((row: any) => {
        const has6Cols = row.length >= 6 || (row[3] === "info" || row[3] === "warning" || row[3] === "urgent");
        return {
          announcementId: row[0] || "",
          title: has6Cols ? (row[1] || "Announcement") : "Announcement",
          message: has6Cols ? (row[2] || "") : (row[1] || ""),
          type: (has6Cols ? row[3] : "info") as "info" | "warning" | "urgent",
          active: (has6Cols ? row[4] : row[2]) === "TRUE",
          createdAt: (has6Cols ? row[5] : row[3]) || "",
        };
      })
      .filter((item: Announcement) => item.announcementId);

    // Sort newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error: any) {
    console.warn("Failed to fetch all announcements:", error.message || error);
    return [];
  }
}

export async function createAnnouncement(
  title: string,
  message: string,
  type: "info" | "warning" | "urgent" = "info"
): Promise<Announcement> {
  const sheets = getSheetsClient();
  const id = `ANN-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const cleanTitle = title.trim() || "Announcement";

  // 1. Verify / bootstrap Announcements sheet tab if missing
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Announcements!A1:F1",
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
      // Write 6 headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        range: "Announcements!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["announcementId", "title", "message", "type", "active", "createdAt"]],
        },
      });
    } catch (bootstrapErr: any) {
      console.error("Failed to bootstrap Announcements tab:", bootstrapErr.message || bootstrapErr);
      throw bootstrapErr;
    }
  }

  // Ensure header is updated to 6 columns if it was 4
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Announcements!A1:F1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["announcementId", "title", "message", "type", "active", "createdAt"]],
      },
    });
  } catch {
    // Ignore header update errors
  }

  // 2. Append new announcement row
  const values = [[id, cleanTitle, message, type, "TRUE", timestamp]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Announcements!A2:F2",
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });

  return {
    announcementId: id,
    title: cleanTitle,
    message,
    type,
    active: true,
    createdAt: timestamp,
  };
}

export async function toggleAnnouncementActive(id: string, active: boolean): Promise<void> {
  const sheets = getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: "Announcements!A2:F1000",
  });

  const rows = response.data.values || [];
  const index = rows.findIndex((row: any) => row[0] && row[0].trim() === id);

  if (index !== -1) {
    const rowNumber = index + 2;
    const row = rows[index];
    const has6Cols = row.length >= 6 || (row[3] === "info" || row[3] === "warning" || row[3] === "urgent");
    const activeColumn = has6Cols ? "E" : "C";

    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: `Announcements!${activeColumn}${rowNumber}`,
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
    range: "Announcements!A2:F1000",
  });

  const rows = response.data.values || [];
  const index = rows.findIndex((row: any) => row[0] && row[0].trim() === id);

  if (index !== -1) {
    const rowNumber = index + 2;
    // Clear values of the matching row
    await sheets.spreadsheets.values.clear({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: `Announcements!A${rowNumber}:F${rowNumber}`,
    });
  }
}
