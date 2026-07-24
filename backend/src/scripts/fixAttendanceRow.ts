import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const env = {
  GOOGLE_SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT || "",
  GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID || "",
};

const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
const privateKey = credentials.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

async function fixRow() {
  console.log("Updating Registrations!Q2 to TRUE...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Registrations!Q2",
    valueInputOption: "RAW",
    requestBody: {
      values: [["TRUE"]],
    },
  });
  console.log("✅ Registrations!Q2 updated to TRUE successfully!");
}

fixRow().catch(console.error);
