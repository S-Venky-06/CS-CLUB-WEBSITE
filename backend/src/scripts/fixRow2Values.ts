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

async function fixRow2() {
  console.log("Fetching row 2 in Registrations...");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Registrations!A2:R2",
  });

  const row = response.data.values?.[0] || [];
  console.log("Current raw row 2 values:", row);

  // Re-align shifted values:
  // Col A: registrationId
  // Col B: eventId
  // Col C: email
  // Col D: name
  // Col E: registeredAt
  // Col F: motivation (was in G)
  // Col G: phone (was in H)
  // Col H: year (was in I)
  // Col I: section (was in J)
  // Col J: branch (was in K)
  // Col K: rollNumber (was in L)
  // Col L-P: projects, linkedin, tryhackme, hackthebox, otherComments
  // Col Q: attended
  // Col R: mail-status

  const fixedRow = [
    row[0] || "REG-EVT-01-WCRIVPNY", // registrationId
    row[1] || "evt-01",              // eventId
    row[2] || "samavenky654@gmail.com", // email
    row[3] || "Subramanyam Venkatesh Sama Silva", // name
    row[4] || new Date().toISOString(), // registeredAt
    row[6] || "afsd saf sf fadsf",    // motivation (from G)
    row[7] || "1234567890",           // phone (from H)
    row[8] || "2nd Year",             // year (from I)
    row[9] || "A",                    // section (from J)
    row[10] || "CSE",                 // branch (from K)
    row[11] || "HG",                  // rollNumber (from L)
    "",                               // projects
    "",                               // linkedin
    "",                               // tryhackme
    "",                               // hackthebox
    "",                               // otherComments
    "TRUE",                           // attended
    row[17] || row[16] || "SENT",     // mail-status
  ];

  console.log("Writing corrected row 2 values:", fixedRow);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Registrations!A2:R2",
    valueInputOption: "RAW",
    requestBody: {
      values: [fixedRow],
    },
  });

  console.log("✅ Row 2 column values realigned and fixed successfully!");
}

fixRow2().catch(console.error);
