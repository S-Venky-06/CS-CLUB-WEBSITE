import dotenv from "dotenv";

dotenv.config();

export const env = {
  /** Server port — defaults to 5000 */
  PORT: parseInt(process.env.PORT || "5000", 10),

  /** Current runtime environment */
  NODE_ENV: (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test",

  /** Frontend origin for CORS */
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  /** Secret used to sign session cookies */
  SESSION_SECRET: process.env.SESSION_SECRET || "default-session-secret-change-me-in-production-32-chars-long",

  /** Google OAuth credentials (future) */
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",

  /** Admin roles configurations */
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  SUPER_ADMIN_EMAILS: (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),

  /** Google Sheets service account JSON (future) */
  GOOGLE_SERVICE_ACCOUNT: process.env.GOOGLE_SERVICE_ACCOUNT || "",

  /** Google Sheets target spreadsheet ID */
  GOOGLE_SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID || "",
} as const;

/** Whether the app is running in production */
export const isProduction = env.NODE_ENV === "production";
