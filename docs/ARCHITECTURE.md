# Architecture

This document describes the full-stack architecture of the Cybersecurity Club of GCET website, including the communication flows, authentication model, data layer, and deployment topology.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND — Next.js 16 (App Router)                 │
│  Hosted on: Vercel                                              │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  Public Pages │ │  Dashboard   │ │  Providers & Layout      │ │
│  │  /, /members, │ │  /dashboard  │ │  GoogleOAuth, Navbar,    │ │
│  │  /events      │ │  (admin)     │ │  Footer, BackendWakeup   │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│                                                                 │
│  Client-side: Framer Motion animations, jsPDF report generation │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS REST API (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND — Express.js 5 + TypeScript                │
│  Hosted on: Vercel (Serverless Functions)                       │
│                                                                 │
│  ┌────────┐ ┌────────────┐ ┌─────────────┐ ┌────────────────┐  │
│  │ Routes │→│ Controllers│→│  Services   │→│  Repositories  │  │
│  └────────┘ └────────────┘ └─────────────┘ └───────┬────────┘  │
│                                                     │           │
│  Middleware: Helmet, CORS, Rate Limiter, Session,    │           │
│             Auth Guard, Role Guard, Zod Validation   │           │
└──────────────────────────────────────────────────────┬──────────┘
                                                       │ Service Account JWT
                                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DATA LAYER — Google Sheets API v4                │
│                                                                 │
│  Worksheets:                                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │    Events     │ │ Registrations│ │      Members             │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  GD Results   │ │  Settings    │ │  Activity / Announcements│ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Tech Stack
- **Framework:** Next.js 16 with App Router and React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Custom Glassmorphism/Cyberpunk design system
- **Animations:** Framer Motion (micro-interactions, page transitions, section reveals)
- **Icons:** Lucide React
- **Auth:** `@react-oauth/google` for Google OAuth client
- **PDF Reports:** `jsPDF` + `jspdf-autotable` (client-side generation)

### Page Structure (`src/app/`)

| Route | Description | Auth |
|:---|:---|:---|
| `/` | Home — Hero, Mission, Members preview, Featured Event, Gallery, Team DDMM showcase | Public |
| `/members` | Full interactive members directory (Leadership, Leads, Core, Fresh Talent) | Public |
| `/events` | Event listing and registration form | Public (registration requires login) |
| `/dashboard` | Admin Command Center — overview metrics, live activity | Admin |
| `/dashboard/events` | Event CRUD management | Admin |
| `/dashboard/registrations` | View/filter all registrations, toggle attendance | Admin |
| `/dashboard/members` | Member roster management (add, promote, visibility) | Super Admin |
| `/dashboard/gd-management` | GD recruitment panel (randomize, evaluate, shortlist) | Admin |
| `/dashboard/notifications` | Announcement banner management | Admin |
| `/dashboard/activity` | Activity/audit log viewer | Admin |
| `/dashboard/settings` | Club settings, API connection status | Admin |

### Component Organization (`src/components/`)

| Directory | Purpose |
|:---|:---|
| `background/` | Animated particle canvas (cyberpunk mesh backdrop) |
| `hero/` | HeroSection with animated headlines, MomentsShowcase |
| `layout/` | Navbar, Footer, ActiveEventPopup, AnnouncementBanner, GoogleAuthNoticeModal |
| `providers/` | BackendWakeupProvider (pings backend on cold start) |
| `sections/` | FeaturedEvent, GalleryPreview, MembersSection, MissionSection, TeamDDMMShowcase |
| `transitions/` | SectionReveal (scroll-based Framer Motion reveal animations) |

---

## Backend Architecture

### Tech Stack
- **Runtime:** Node.js + Express.js 5
- **Language:** TypeScript (compiled with `tsx` for development)
- **Database:** Google Sheets API v4 (via `googleapis` client library)
- **Auth:** Google OAuth 2.0 token verification + JWT session tokens
- **Security:** Helmet, CORS, express-rate-limit, express-session
- **Validation:** Zod schemas
- **Logging:** Morgan (HTTP request logging)

### Layered Architecture

```
Request → Routes → Middleware → Controllers → Services → Repositories → Google Sheets
```

| Layer | Directory | Responsibility |
|:---|:---|:---|
| **Routes** | `src/routes/` | HTTP method + path definitions, middleware chaining |
| **Middleware** | `src/middleware/` | `requireAuth`, `requireRole`, `errorHandler`, `notFoundHandler` |
| **Controllers** | `src/controllers/` | Request parsing, response formatting, delegation to services |
| **Services** | `src/services/` | Business logic, validation rules, orchestration |
| **Repositories** | `src/repositories/` | Direct Google Sheets read/write operations |
| **Validators** | `src/validators/` | Zod schemas for request body validation |
| **Config** | `src/config/` | Environment variables, CORS, rate limiting, session config |
| **Utils** | `src/utils/` | `ApiError`, `asyncHandler`, `sendResponse`, JWT `token` utils |
| **Constants** | `src/constants/` | HTTP status codes |
| **Types** | `src/types/` | TypeScript interfaces (`SessionUser`, `Registration`, `Event`, etc.) |

### Authentication Flow

```
1. User clicks "Sign in with Google" on frontend
2. @react-oauth/google returns a Google ID Token
3. Frontend POSTs token to POST /api/v1/auth/google
4. Backend verifies token with google-auth-library
5. Backend looks up user role:
   a. Check SUPER_ADMIN_EMAILS env var
   b. Check ADMIN_EMAILS env var
   c. Query Members Google Sheet
   d. Default to "member"
6. Backend creates session + generates JWT
7. Frontend stores JWT, sends it as Bearer token on subsequent requests
8. Backend middleware (app.ts) extracts Bearer token and populates req.session.user
```

### Data Flow (Google Sheets)

The backend uses a **Google Cloud Service Account** to authenticate with the Google Sheets API. The service account JSON credentials are stored in the `GOOGLE_SERVICE_ACCOUNT` environment variable.

```
Backend → googleapis client → Service Account JWT Auth → Google Sheets API v4
```

Each domain has its own repository file that reads from/writes to a specific worksheet tab:

| Repository | Worksheet | Operations |
|:---|:---|:---|
| `event.repository.ts` | Events | CRUD for events |
| `registration.repository.ts` | Registrations | Create, read, filter, update attendance |
| `member.repository.ts` | Members | Read, update roles/display, add members |
| `gd.repository.ts` | GD Results | Team randomization, evaluation scoring, shortlisting |
| `settings.repository.ts` | Settings | Read/update club configuration |
| `activity.repository.ts` | Activity | Append audit log entries, read logs |
| `announcement.repository.ts` | Announcements | CRUD for announcement banners |
| `googleSheets.client.ts` | — | Shared authenticated Sheets client singleton |

---

## Security Model

| Layer | Mechanism | Implementation |
|:---|:---|:---|
| Transport | HTTPS | Enforced by Vercel |
| Headers | Security headers | `helmet()` middleware |
| CORS | Origin allowlist | Dynamic CORS with env-based allowed origins |
| Rate Limiting | Global + scoped | `express-rate-limit` (100/15min global, 10/1min auth) |
| Authentication | Google OAuth 2.0 + JWT | `google-auth-library` verification, custom JWT signing |
| Authorization | Role-based guards | `requireAuth` and `requireRole()` middleware |
| Input Validation | Schema validation | Zod schemas on request bodies |
| Session | Server-side sessions | `express-session` with cookie-based session IDs |
| Self-action prevention | Controller guards | Cannot modify own role, cannot modify env-seeded admins |

---

## Deployment Topology

### Frontend (Vercel)
- **Platform:** Vercel
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output:** Static + Server-Side Rendered pages via Vercel Edge/Serverless
- **Environment Variables:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Backend (Vercel Serverless)
- **Platform:** Vercel (deployed as serverless functions via `vercel.json`)
- **Entry Point:** `api/index.ts` (rewrites all routes to `/api`)
- **Build:** TypeScript compiled at deploy time
- **Environment Variables:** `PORT`, `NODE_ENV`, `SESSION_SECRET`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`, `SUPER_ADMIN_EMAILS`, `GOOGLE_SERVICE_ACCOUNT`, `GOOGLE_SPREADSHEET_ID`

### Environment Separation

| Environment | Frontend URL | Backend URL | `NODE_ENV` |
|:---|:---|:---|:---|
| Development | `http://localhost:3000` | `http://localhost:5000` | `development` |
| Production | `https://<your-domain>.vercel.app` | `https://<your-backend>.vercel.app` | `production` |

In development, CORS automatically allows `localhost:3000` and `127.0.0.1:3000`. In production, only the configured `FRONTEND_URL` (and `*.vercel.app` subdomains if the frontend is on Vercel) are permitted.
