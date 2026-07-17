export type UserRole = "member" | "admin" | "super_admin";

/** User info stored in the server session and returned to the frontend */
export interface SessionUser {
  email: string;
  name: string;
  picture: string;
  role: UserRole;
  loginAt: string;
}

/** Raw user details decoded from Google ID token */
export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}
