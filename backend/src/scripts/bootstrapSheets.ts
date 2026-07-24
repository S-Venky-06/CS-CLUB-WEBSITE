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

const requiredSheets = [
  {
    title: "Events",
    headers: ["eventId", "title", "description", "date", "capacity", "deadline", "status", "location"],
  },
  {
    title: "Members",
    headers: ["email", "name", "role", "visible", "displayOrder"],
  },
  {
    title: "Registrations",
    headers: [
      "registrationId",
      "eventId",
      "email",
      "name",
      "registeredAt",
      "motivation",
      "phone",
      "year",
      "section",
      "branch",
      "rollNumber",
      "projects",
      "linkedin",
      "tryhackme",
      "hackthebox",
      "otherComments",
      "attended",
    ],
  },
  {
    title: "Announcements",
    headers: ["announcementId", "message", "active", "createdAt"],
  },
  {
    title: "ActivityLogs",
    headers: ["logId", "timestamp", "email", "action", "details", "ipAddress"],
  },
  {
    title: "Settings",
    headers: ["key", "value"],
  },
];

async function bootstrap() {
  console.log(`Connected to Google Spreadsheet: ${spreadsheetId}`);
  console.log(`Using Service Account: ${credentials.client_email}\n`);

  // 1. Get existing sheets
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = new Set(
    (meta.data.sheets || []).map((s) => s.properties?.title).filter(Boolean)
  );

  console.log("Existing tabs found:", Array.from(existingTitles).join(", ") || "(none)");

  // 2. Add missing sheets
  const addRequests: any[] = [];
  for (const sheetDef of requiredSheets) {
    if (!existingTitles.has(sheetDef.title)) {
      console.log(`Creating tab: ${sheetDef.title}...`);
      addRequests.push({
        addSheet: {
          properties: {
            title: sheetDef.title,
          },
        },
      });
    }
  }

  if (addRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: addRequests,
      },
    });
    console.log(`Successfully created ${addRequests.length} new tab(s).\n`);
  } else {
    console.log("All required tabs already exist.\n");
  }

  // 3. Populate Header Rows (Row 1)
  for (const sheetDef of requiredSheets) {
    console.log(`Writing headers for tab: ${sheetDef.title}...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetDef.title}!A1:${String.fromCharCode(64 + sheetDef.headers.length)}1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [sheetDef.headers],
      },
    });
  }

  console.log("\n✅ All Google Sheet tabs and header rows created successfully!");
}

bootstrap().catch((err) => {
  console.error("❌ Failed to initialize Google Sheets:", err.message || err);
  process.exit(1);
});
