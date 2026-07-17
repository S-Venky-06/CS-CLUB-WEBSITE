import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";

export interface ActivityLogEntry {
  timestamp: string;
  email: string;
  action: string;
  details: string;
}

export async function logActivity(email: string, action: string, details: string): Promise<void> {
  const sheets = getSheetsClient();
  const timestamp = new Date().toISOString();

  // 1. Verify / bootstrap the ActivityLog worksheet if missing
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "ActivityLog!A2:D2",
    });
  } catch (err: any) {
    console.log("ActivityLog tab missing. Attempting to bootstrap ActivityLog worksheet...");
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "ActivityLog",
                },
              },
            },
          ],
        },
      });
      // Write headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        range: "ActivityLog!A1:D1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["timestamp", "email", "action", "details"]],
        },
      });
    } catch (bootstrapErr: any) {
      console.error("Failed to bootstrap ActivityLog tab:", bootstrapErr.message || bootstrapErr);
      return; // Soft fail to prevent locking the user out of core operations
    }
  }

  // 2. Append new log entry row
  try {
    const values = [[timestamp, email, action, details]];
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "ActivityLog!A2:D2",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });
  } catch (error: any) {
    console.error("Failed to append activity log entry:", error.message || error);
  }
}

export async function findAllActivities(): Promise<ActivityLogEntry[]> {
  const sheets = getSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "ActivityLog!A2:D10000",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const logs: ActivityLogEntry[] = rows.map((row: any) => ({
      timestamp: row[0] || "",
      email: row[1] || "",
      action: row[2] || "",
      details: row[3] || "",
    }));

    // Sort newest first
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error: any) {
    console.warn("Failed to retrieve activity logs (tab probably missing):", error.message || error);
    return [];
  }
}
