import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const env = {
  GOOGLE_SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT || "",
  GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID || "",
};

if (!env.GOOGLE_SERVICE_ACCOUNT || !env.GOOGLE_SPREADSHEET_ID) {
  console.error("Error: GOOGLE_SERVICE_ACCOUNT or GOOGLE_SPREADSHEET_ID is missing in .env");
  process.exit(1);
}

const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
const privateKey = credentials.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

const featuredEventRow = [
  "evt-01",
  "New Club Members Registration — For Juniors",
  "Calling all juniors! Join the Cybersecurity Club of GCET to learn more about CTF, Cybersecurity and many more. No prior experience is required just curiosity and a passion for technology. Sign up!!!! Note : Only 2nd Years Can Register.",
  new Date().toISOString(),
  "200",
  "2030-12-31T23:59:59.000Z",
  "active",
  "Online Registration",
];

async function insertFeaturedEvent() {
  console.log(`Connecting to Google Spreadsheet: ${spreadsheetId}`);

  // 1. Check if evt-01 already exists
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Events!A2:H500",
  });

  const rows = response.data.values || [];
  const existingIndex = rows.findIndex((r: any[]) => r[0] === "evt-01");

  if (existingIndex !== -1) {
    const rowNumber = existingIndex + 2;
    console.log(`Updating existing event 'evt-01' at row ${rowNumber}...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Events!A${rowNumber}:H${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [featuredEventRow],
      },
    });
    console.log("✅ Event 'evt-01' updated successfully!");
  } else {
    console.log("Inserting new featured event 'evt-01'...");
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Events!A2:H2",
      valueInputOption: "RAW",
      requestBody: {
        values: [featuredEventRow],
      },
    });
    console.log("✅ Event 'evt-01' inserted successfully!");
  }
}

insertFeaturedEvent().catch((err) => {
  console.error("❌ Failed to insert event:", err.message || err);
  process.exit(1);
});
