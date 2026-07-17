import { OAuth2Client } from "google-auth-library";
import { env } from "../config/index.js";
import { ApiError } from "../utils/index.js";
import { HttpStatus } from "../constants/index.js";
import type { GoogleUser } from "../types/index.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token.
 * @param idToken The token string sent by the frontend
 * @throws ApiError if verification fails or email is unverified
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUser> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new ApiError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "Google Client ID is not configured on the server.",
    );
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid Google token payload.");
    }

    const { email, name, picture, email_verified } = payload;

    if (!email) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Google token missing email address.");
    }

    if (!email_verified) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Google email address is not verified.");
    }

    return {
      email,
      name: name || "",
      picture: picture || "",
      email_verified: !!email_verified,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      HttpStatus.UNAUTHORIZED,
      `Google token verification failed: ${(error as Error).message}`,
    );
  }
}
