import "express-session";
import { SessionUser } from "./auth.js";

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}
