import { google } from "googleapis";
import { env } from "../config/index.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";

let sheetsInstance: any = null;

/**
 * Initializes and caches the Google Sheets v4 API client.
 * Uses Service Account credentials from env.GOOGLE_SERVICE_ACCOUNT.
 */
export function getSheetsClient() {
  if (sheetsInstance) return sheetsInstance;

  if (!env.GOOGLE_SERVICE_ACCOUNT) {
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Google Service Account key is not configured. Please add GOOGLE_SERVICE_ACCOUNT to your environment.",
    );
  }

  try {
    const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
    
    const privateKey = credentials.private_key.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsInstance = google.sheets({ version: "v4", auth });
    return sheetsInstance;
  } catch (error) {
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      `Failed to initialize Google Sheets client: ${(error as Error).message}`,
    );
  }
}
