import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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

async function updateHeaders() {
  const headers = [
    "registrationId",
    "eventId",
    "email",
    "name",
    "registeredAt",
    "phone",
    "year",
    "section",
    "branch",
    "rollNumber",
    "otherComments",
    "attended",
    "paymentStatus",
    "transactionId",
    "teamSize",
    "teamMembers",
    "emailStatus",
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SPREADSHEET_ID,
    range: `Registrations!A1:Q1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [headers],
    },
  });

  console.log("Headers updated successfully with emailStatus!");
}

updateHeaders().catch(console.error);
