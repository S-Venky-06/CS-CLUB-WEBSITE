import crypto from "crypto";
import { env } from "../config/index.js";
import type { SessionUser } from "../types/index.js";

// Use SESSION_SECRET as the token signing key
if (!env.SESSION_SECRET) {
  throw new Error("FATAL ERROR: SESSION_SECRET environment variable is missing. The server cannot start securely.");
}
const SECRET = env.SESSION_SECRET;

/**
 * Generates a signed token (JWT-style) for a given user payload.
 */
export function generateToken(payload: SessionUser): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verifies a token signature and returns the decoded payload, or null if invalid.
 */
export function verifyToken(token: string): SessionUser | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
    
  try {
    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSignature);
    
    if (sigBuffer.length !== expectedSigBuffer.length) {
      return null;
    }
    
    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      return null;
    }
  } catch {
    return null;
  }
  
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload || typeof payload.email !== "string" || !payload.email.trim() ||
        typeof payload.name !== "string" || typeof payload.picture !== "string" ||
        !["member", "admin", "super_admin"].includes(payload.role) ||
        typeof payload.loginAt !== "string") return null;
    const loginAt = Date.parse(payload.loginAt);
    const age = Date.now() - loginAt;
    if (!Number.isFinite(loginAt) || age < 0 || age >= 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
