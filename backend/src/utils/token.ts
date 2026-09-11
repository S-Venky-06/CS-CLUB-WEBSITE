import crypto from "crypto";
import { env } from "../config/index.js";

// Use SESSION_SECRET as the token signing key
if (!env.SESSION_SECRET) {
  throw new Error("FATAL ERROR: SESSION_SECRET environment variable is missing. The server cannot start securely.");
}
const SECRET = env.SESSION_SECRET;

/**
 * Generates a signed token (JWT-style) for a given user payload.
 */
export function generateToken(payload: any): string {
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
export function verifyToken(token: string): any | null {
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
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
