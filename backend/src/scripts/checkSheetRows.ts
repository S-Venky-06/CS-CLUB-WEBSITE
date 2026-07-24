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

async function checkRows() {
  console.log("Checking Registrations sheet rows...");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Registrations!A1:R100",
  });

  const rows = response.data.values || [];
  console.log(`Total rows found: ${rows.length}`);
  rows.forEach((row, i) => {
    console.log(`Row ${i + 1}: ID=${row[0]}, Email=${row[2]}, Name=${row[3]}, Attended(Q)=${row[16]}, MailStatus(R)=${row[17]}`);
  });
}

checkRows().catch(console.error);
