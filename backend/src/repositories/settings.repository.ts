import { getSheetsClient } from "./googleSheets.client.js";
import { env } from "../config/index.js";

export interface ClubSettings {
  clubName: string;
  clubDiscord: string;
  clubGithub: string;
  clubLinkedIn: string;
  registrationOpen: boolean;
}

const DEFAULT_SETTINGS: ClubSettings = {
  clubName: "Cyber Security Club",
  clubDiscord: "",
  clubGithub: "",
  clubLinkedIn: "",
  registrationOpen: true,
};

export async function findSettings(): Promise<ClubSettings> {
  const sheets = getSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Settings!A2:B100",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return DEFAULT_SETTINGS;
    }

    const settingsMap: Record<string, string> = {};
    for (const row of rows) {
      if (row[0]) {
        settingsMap[row[0].trim()] = row[1] ? row[1].trim() : "";
      }
    }

    return {
      clubName: settingsMap.clubName || DEFAULT_SETTINGS.clubName,
      clubDiscord: settingsMap.clubDiscord || DEFAULT_SETTINGS.clubDiscord,
      clubGithub: settingsMap.clubGithub || DEFAULT_SETTINGS.clubGithub,
      clubLinkedIn: settingsMap.clubLinkedIn || DEFAULT_SETTINGS.clubLinkedIn,
      registrationOpen: settingsMap.registrationOpen === "FALSE" ? false : true,
    };
  } catch (error: any) {
    console.warn("Failed to fetch settings from sheet (probably 'Settings' tab is missing):", error.message || error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const sheets = getSheetsClient();
  
  // 1. Fetch current settings rows to find the row index
  let rows: string[][] = [];
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Settings!A2:B100",
    });
    rows = response.data.values || [];
  } catch (err: any) {
    // If settings sheet is missing, bootstrap it first!
    console.log("Settings tab missing. Attempting to bootstrap Settings worksheet...");
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Settings",
                },
              },
            },
          ],
        },
      });
      // Write headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
        range: "Settings!A1:B1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["key", "value"]],
        },
      });
    } catch (bootstrapErr: any) {
      console.error("Failed to bootstrap Settings tab:", bootstrapErr.message || bootstrapErr);
      throw bootstrapErr;
    }
  }

  // Find index
  const index = rows.findIndex(r => r[0] && r[0].trim() === key);
  const stringValue = String(value);

  if (index === -1) {
    // Append new setting
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: "Settings!A2:B2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[key, stringValue]],
      },
    });
  } else {
    // Update existing setting row cell (A2:B100 maps to index + 2 row number)
    const rowNumber = index + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
      range: `Settings!B${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[stringValue]],
      },
    });
  }
}
