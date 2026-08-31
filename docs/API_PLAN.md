# API Plan

This document defines the complete REST API contract between the Next.js 16 frontend and the Express.js backend for the Cybersecurity Club of GCET.

---

## Base URL

| Environment | Base URL |
|:---|:---|
| Development | `http://localhost:5000/api/v1` |
| Production | `https://<your-backend-domain>/api/v1` |

---

## Authentication

All protected endpoints require a **Bearer Token** in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

Tokens are issued upon successful Google OAuth login via `POST /api/v1/auth/google`. The backend also supports server-side sessions via cookies as a fallback.

### Role Hierarchy

| Role | Access Level |
|:---|:---|
| `member` | Public + Registration endpoints |
| `admin` | All member access + Admin Dashboard (events, registrations, GD, announcements, activity logs) |
| `super_admin` | All admin access + Member management (add/promote/demote), GD team randomization/clearing, seed-protected operations |

Role assignment priority:
1. `SUPER_ADMIN_EMAILS` env var (highest)
2. `ADMIN_EMAILS` env var
3. `Members` Google Sheet lookup
4. Defaults to `member`

---

## Standard Response Format

All endpoints return responses in this consistent JSON envelope:

```json
{
  "success": true,
  "message": "Human-readable status message.",
  "data": { }
}
```

Error responses follow the same format with `"success": false` and an appropriate HTTP status code.

---

## Rate Limiting

| Scope | Window | Max Requests | Notes |
|:---|:---|:---|:---|
| Global | 15 minutes | 100 | Applies to all endpoints |
| Auth routes | 1 minute | 10 | Scoped limiter on `/auth/*` to prevent brute-force |

Rate limit headers follow the `draft-8` standard. When exceeded, a `429 Too Many Requests` response is returned.

---

## Endpoints

### 🟢 Public Endpoints (No Auth Required)

#### `GET /`
- **Description:** Root health check. Confirms the API server is online.
- **Response:** `{ success: true, message: "CS-CLUB Backend API is online and running.", healthCheck: "/api/v1/health" }`

#### `GET /api/v1/health`
- **Description:** Lightweight health probe for uptime monitoring.
- **Response:** `{ success: true, message: "OK" }`

#### `GET /api/v1/announcements`
- **Description:** Lists all currently **active** public announcements (banners).
- **Response:** Array of announcement objects `{ id, title, message, type, active, createdAt }`.
- **Fallback:** Returns an empty array `[]` if the Announcements sheet is unavailable.

#### `GET /api/v1/events/featured`
- **Description:** Retrieves details of the featured/live event (hardcoded as `evt-01`).
- **Response:** Event object `{ eventId, title, description, date, capacity, deadline, status }`.
- **Error:** `404` if `evt-01` is not configured in Google Sheets.

---

### 🔐 Auth Endpoints (`/api/v1/auth`)

All auth routes are protected by a scoped rate limiter (10 req/min).

#### `POST /api/v1/auth/google`
- **Description:** Authenticates a user via a Google OAuth ID token. Creates a server session and returns a JWT.
- **Body:**
  ```json
  { "idToken": "google-oauth-id-token-string" }
  ```
- **Validation:** `idToken` is required (Zod schema).
- **Response:** `{ user: SessionUser, token: "jwt-string" }`
- **Side Effects:** Regenerates session to prevent session fixation. Looks up user role from env vars and the Members Google Sheet.

#### `GET /api/v1/auth/me` 🔒
- **Description:** Returns the currently authenticated user's profile from the active session.
- **Response:** `SessionUser { email, name, picture, role, loginAt }`

#### `POST /api/v1/auth/logout` 🔒
- **Description:** Destroys the server session and clears the `sid` cookie.
- **Response:** `{ message: "Logged out successfully." }`

---

### 📝 Registration Endpoints (`/api/v1/registrations`) 🔒

All registration routes require authentication (`requireAuth`).

#### `POST /api/v1/registrations`
- **Description:** Registers the authenticated user for a specific event.
- **Validation:** Zod schema (`eventRegistrationSchema`) validates all fields.
- **Body:**
  ```json
  {
    "eventId": "evt-01",
    "name": "Student Name",
    "phone": "9876543210",
    "year": "3",
    "section": "A",
    "branch": "CSE",
    "rollNumber": "21R11A0501",
    "motivation": "I want to learn about cybersecurity.",
    "projects": "Built a port scanner in Python",
    "linkedin": "https://linkedin.com/in/example",
    "tryhackme": "https://tryhackme.com/p/example",
    "hackthebox": "https://app.hackthebox.com/profile/12345",
    "otherComments": "Available on weekends"
  }
  ```
- **Business Rules:**
  1. Event must exist and have `status: "active"`.
  2. Registration deadline must not have passed.
  3. User must not already be registered for this event (duplicate check by email).
  4. Event must not be at full capacity.
- **Response:** `201 Created` with the generated registration object (includes `registrationId`).

#### `GET /api/v1/registrations/me`
- **Description:** Retrieves all event registrations belonging to the logged-in user.
- **Response:** Array of `Registration` objects.

---

### 🛡️ Admin Endpoints (`/api/v1/admin`) 🔒👑

All admin routes require `requireAuth` + `requireRole("admin")`. Some routes additionally require `requireRole("super_admin")`.

#### Events CRUD

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/events` | admin | List all events (including cancelled/completed) |
| `POST` | `/admin/events` | admin | Create a new event (Zod-validated) |
| `PUT` | `/admin/events/:eventId` | admin | Update an existing event's details |
| `DELETE` | `/admin/events/:eventId` | admin | Archive/cancel an event |

#### Registrations

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/registrations` | admin | List all registrations across all events |
| `PUT` | `/admin/registrations/:registrationId/attendance` | admin | Toggle attendance (present/absent) for a student |

#### Member Management

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/members` | admin | List all club members and their roles |
| `POST` | `/admin/members` | **super_admin** | Add a new member to the roster |
| `PATCH` | `/admin/members/:email/role` | **super_admin** | Promote or demote a member's role |
| `PATCH` | `/admin/members/:email/display` | **super_admin** | Update name, visibility, and display order |

**Guards:** Cannot modify your own role. Cannot modify roles of seed admins defined in environment variables.

#### Settings

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/settings` | admin | Retrieve club settings + system info + Google Sheets connection status |
| `PATCH` | `/admin/settings` | admin | Update club settings (`clubName`, `clubDiscord`, `clubGithub`, `clubLinkedIn`, `registrationOpen`) |

#### Activity Logs

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/activities` | admin | Retrieve reverse-chronological activity/audit logs |

#### Announcements

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/announcements` | admin | List all announcements (active + archived) |
| `POST` | `/admin/announcements` | admin | Create a new announcement banner (`title`, `message`, `type: info/warning/urgent`) |
| `PATCH` | `/admin/announcements/:id/active` | admin | Toggle announcement active/archived status |
| `DELETE` | `/admin/announcements/:id` | admin | Permanently delete an announcement |

#### GD (Group Discussion) Recruitment Panel

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/gd/results` | admin | Fetch all GD results and team assignments |
| `GET` | `/admin/gd/shortlist-round2` | admin | Fetch all Round 2 shortlisted candidates |
| `POST` | `/admin/gd/randomize` | **super_admin** | Shuffle registered candidates into randomized GD teams (body: `{ targetTeamSize: number }`) |
| `POST` | `/admin/gd/clear` | **super_admin** | Clear all GD teams and evaluations |
| `POST` | `/admin/gd/assign-supervisors` | admin | Assign supervisor(s) to a GD team (body: `{ gdTeam, supervisors[] }`) |
| `POST` | `/admin/gd/evaluate` | admin | Submit 5-criteria scores + comments for a candidate. Non-super_admins can only evaluate teams assigned to them. |
| `POST` | `/admin/gd/shortlist-round2` | admin | Shortlist a candidate for Round 2 |
| `POST` | `/admin/gd/unshortlist-round2` | admin | Remove a candidate from the Round 2 shortlist |

---

## Error Codes Reference

| HTTP Status | Meaning | Common Cause |
|:---|:---|:---|
| `400` | Bad Request | Missing/invalid parameters, deadline passed, event at capacity |
| `401` | Unauthorized | Missing or invalid Bearer token / session |
| `403` | Forbidden | Insufficient role (e.g., admin trying super_admin action), not assigned as GD supervisor |
| `404` | Not Found | Event or registration ID does not exist |
| `409` | Conflict | Duplicate registration or duplicate event ID |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Google Sheets API failure or unhandled exception |
