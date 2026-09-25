# Vercel Performance Implementation Plan

This document outlines a phased implementation roadmap to optimize the performance, scalability, and reliability of the CS-CLUB platform (Next.js frontend and Express backend) deployed on Vercel. 

## Current Architecture and Verified Bottlenecks
- **Frontend:** Next.js 16.3.4 (App Router) deployed on Vercel.
- **Backend:** Express 5.1.0 deployed on Vercel Serverless Functions.
- **Storage:** Google Sheets acting as the primary database.
- **Identified Bottlenecks:**
  - **No Caching:** Public endpoints (`/events/featured`, `/announcements`) lack `Cache-Control` headers, causing the backend to execute full Google Sheets API scans on every frontend page load.
  - **Frontend Fetch Deduplication:** Multiple components fetch the same public data independently, multiplying upstream requests.
  - **Render Blocking:** Randomizer logic for the hero image (`MomentsShowcase.tsx`) forces a placeholder render and defers image fetching until hydration.
  - **Asset Weight:** Uncompressed original photos (up to 14MB each) are deployed in the carousel, straining the image optimizer and increasing Vercel bandwidth costs.
  - **State and Auth Bottlenecks:** Uses instance-local `express-session` and `express-rate-limit`, rendering them ineffective across horizontally scaling serverless functions.
  - **Google Sheets Quotas:** Every transactional operation scans large ranges. Under burst traffic, this leads to 429 quota exhaustion and high response latencies.

## Explicit Scope and Preserved Behavior
**CRITICAL REQUIREMENT:** The existing startup loader must remain **exactly as is**. Its visual design, animations, messages, timing, skip button, and session behavior are preserved. It will not be bypassed, shortened, or replaced.

The following functionality remains unchanged:
- The site's visual identity, CSS animations, responsiveness, and accessibility.
- Google login, role-based access, registration forms (including Teams), payment checkouts/verifications, webhooks, and email confirmations.
- Authoritative backend validations (deadlines, capacity, uniqueness).
- Private/authenticated data will be strictly excluded from shared CDN caches.
- Frontend and backend remain deployed as two separate Vercel projects.

## Baseline Measurement Plan
Before beginning implementation, establish a baseline using Vercel Speed Insights, Lighthouse, and network logs:
- **Frontend Metrics:** Mobile LCP (Largest Contentful Paint), INP (Interaction to Next Paint), CLS (Cumulative Layout Shift), total transferred JS/image bytes, and total request counts.
- **Backend Metrics:** API p50/p95 latency, cold start vs. warm start durations, Sheets call counts, 429 failures, and Vercel CDN cache hit rates (`x-vercel-cache` header).
- **Segmentation:** Compare logged-out vs. logged-in visits, direct visits vs. client-side navigations, and empty vs. populated caches.
- **Startup Loader:** Measure the startup loader experience separately to guarantee that underlying application optimizations do not alter its fixed timing.

---

## Phased Implementation Roadmap

### Phase 1: Frontend Asset & Rendering Optimizations
**Priority:** High. Delivers immediate LCP/bundle improvements with low risk.
**Files:** `frontend/src/components/hero/MomentsShowcase.tsx`, `frontend/src/app/dashboard/registrations/page.tsx`, `frontend/src/components/AnimatedBackground.tsx`, `/public/moments`.
**Current Behavior:** 
- Hero images wait for JS hydration to pick a random slide.
- Original photos (up to ~14MB) are loaded into the carousel.
- Eager import of `jspdf` libraries inflates bundle size.
- Missing named callback for `resize` listener removal causes listener leaks.
**Proposed Behavior:** 
- The first hero slide is deterministic on the server to allow immediate rendering; randomness/rotation begins post-hydration.
- Source images are compressed/resized (800-1200px wide).
- Heavy libraries like `jspdf` are dynamically loaded via `next/dynamic` or `import()`.
- Named callbacks ensure clean unmounts of event listeners.
**Implementation Steps:**
1. Resize/compress images in `public/moments` to WebP/AVIF formats.
2. Refactor `MomentsShowcase.tsx` to explicitly render index `0` on SSR with `priority={true}`.
3. Wrap `jspdf` functionality in an async `export` handler using dynamic imports.
4. Fix `AnimatedBackground.tsx` `removeEventListener`.
**Dependencies:** None.
**Expected Benefit:** Faster perceived initial load (LCP), smaller initial JS payload, better memory management.
**Effort:** Small.
**Risks & Compatibility:** Over-compression could degrade visual quality.
**Acceptance Criteria:** The first image is visible before JS executes; `jspdf` is excluded from the main dashboard bundle.
**Rollback:** Revert PR commits or restore original images.

### Phase 2: Public API Caching & Fetch Deduplication
**Priority:** High. Significantly reduces backend execution time and Google Sheets API quota consumption.
**Files:** `backend/src/controllers/public.controller.ts`, `backend/src/routes/*.ts`, `frontend/src/components/events/FeaturedEvent.tsx`, `frontend/src/components/events/ActiveEventPopup.tsx`.
**Current Behavior:** 
- Every page load independently queries the backend for public data; backend reads Sheets directly every time.
**Proposed Behavior:** 
- Vercel Edge caching is utilized for public data. The frontend fetches data once per route and shares it via props or React cache.
**Implementation Steps:**
1. In Backend, inject `Cache-Control: public, s-maxage=60, stale-while-revalidate=120` headers for `/announcements`, `/events/featured`, and `/events/past`.
2. Ensure authenticated and transactional routes explicitly return `Cache-Control: private, no-store`.
3. In Frontend, hoist data fetching for public endpoints to shared layout/page Server Components and pass down as props to avoid redundant client calls.
4. Ensure public unauthenticated fetches omit authorization headers to prevent accidental Cache Bypassing or poisoning.
**Dependencies:** None.
**Expected Benefit:** Instantaneous API responses for public data; drastic drop in Sheets API hits.
**Effort:** Medium.
**Risks & Compatibility:** Displaying stale event data for up to 60 seconds after an admin update. Caching upstream 5xx failures as empty HTTP 200s if not careful.
**Acceptance Criteria:** `x-vercel-cache: HIT` on public GET requests; identical public components render without triggering redundant network calls.
**Rollback:** Remove `Cache-Control` headers from backend routes.

### Phase 3: Sheets Efficiency & Background Processing
**Priority:** High. Prevents latency spikes and 429 quota exhaustion.
**Files:** `backend/src/repositories/registration.repository.ts`, `backend/src/repositories/activity.repository.ts`, `backend/src/services/email.service.ts`.
**Current Behavior:** 
- Reads full Sheets redundantly. 
- Emails block HTTP response completion. 
- Repeated schema existence checks on activity logs.
**Proposed Behavior:** 
- Batch Sheets reads (`values.batchGet`) and strip schema checks from the critical path.
- Offload email sending to Vercel's `waitUntil` background execution.
**Implementation Steps:**
1. Refactor `registration.repository.ts` to cache Sheets metadata per request or utilize `batchGet`.
2. Remove sheet provisioning/creation checks from the `activity.repository.ts` logging pipeline (rely on bootstrap scripts instead).
3. Wrap `sendRegistrationConfirmationEmail` in `waitUntil` to let Vercel handle delivery post-response.
**Dependencies:** Requires Vercel functions API (`@vercel/functions`).
**Expected Benefit:** Faster checkout responses; fewer dropped emails; better Sheets API concurrency.
**Effort:** Medium.
**Risks & Compatibility:** `waitUntil` failures are harder to debug without durable queues.
**Acceptance Criteria:** Registration/Payment success endpoints return significantly faster; emails continue to arrive successfully.
**Rollback:** Revert `waitUntil` wrapping to standard async promises.

### Phase 4: Vercel Execution, Routing, and Auth Configuration
**Priority:** Medium. Reduces cross-origin overhead and cold-start impacts.
**Files:** `backend/vercel.json`, `backend/src/config/session.ts`, `backend/api/index.ts`.
**Current Behavior:** 
- Preflight CORS penalties. 
- Instance-local sessions. 
- Monolithic Express app loaded for every endpoint.
**Proposed Behavior:** 
- Streamline routing. 
- Evaluate Region placement (`bom1`). 
- Adopt a scalable auth/rate-limit approach.
**Implementation Steps:**
1. Benchmark Mumbai (`bom1`) vs current region. Set Vercel region optimally for the user base.
2. Switch `express-rate-limit` to a global store (e.g., Vercel KV) or disable it exclusively for cached public reads.
3. Remove `Content-Type: application/json` headers from bodyless GET requests on the frontend to skip CORS preflights.
4. Verify Fluid Compute is enabled in Vercel project settings to mitigate cold starts.
**Dependencies:** Phase 2 (Public API caching).
**Expected Benefit:** Reduced TTFB (Time to First Byte) and consistent rate limiting.
**Effort:** Medium.
**Risks & Compatibility:** Misconfigured regions can inadvertently increase latency if the upstream Sheets API region is distant.
**Acceptance Criteria:** Reduced `OPTIONS` preflight requests in the network tab; rate limiting works uniformly across deployments.
**Rollback:** Revert region settings in Vercel dashboard and frontend request headers.

---

## Optional Database Migration
**Assessment Trigger:** When traffic spikes cause persistent Google Sheets 429 errors, or when concurrent registrations lead to race conditions (e.g., two users booking the last slot simultaneously) that caching cannot resolve.
**Target Architecture:**
- Migrate from Google Sheets to a serverless relational database (e.g., Vercel Postgres) with connection pooling (PgBouncer).
- Formalize Schema: `Events`, `Registrations` (with `teamSize` and `attendedMembers`), `Users`, `Payments`.
- Add unique constraints (`eventId_email`), indexed lookups, and atomic transactions.
**Migration Plan:**
1. Provision DB and apply schema.
2. **Dual-write Phase:** Backend writes to both DB and Sheets (retaining Sheets for organizers). Reads remain mapped to Sheets.
3. **Data Backfill:** Migrate historic data.
4. **Cutover Phase:** Backend reads/writes authoritatively from DB. Sheets becomes an async, unidirectional export target.
**Effort:** Large. Not required for the immediate performance gains outlined in Phases 1-4.

---

## Deployment, Validation, and Rollback Strategy
- **Deployment:** Roll out phases independently via feature branches to a Vercel Staging environment.
- **Validation:** Run automated API tests, verify cache headers with Browser DevTools, and visually inspect UI/Loader integrity. Ensure the Startup Loader works identically on staging.
- **Rollback:** Each phase is isolated to specific commits. In the event of an issue, rollback via Vercel's instant rollback feature. No destructive data migrations are executed in Phases 1-4.

## Open Questions Requiring User Decisions
1. **Shared Rate Limiting:** Should we provision a Vercel KV store for rate limiting and sessions, or switch entirely to JWT for stateless authentication?
2. **Region Selection:** Do we explicitly want to lock the backend to `bom1` (Mumbai) to serve Indian users faster, or rely on Vercel Edge functions for global routing?
3. **Stale Data:** Is a 60-second delay in reflecting Google Sheets edits for public announcements and events acceptable to the administration team?
