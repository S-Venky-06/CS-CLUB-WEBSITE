# Vercel performance review

Reviewed 25 September 2026. Scope: Next.js frontend, Express backend, repositories, authentication, registration/payment request paths, public assets, dashboard, and deployment configuration.

This is a source-code review, not a production benchmark. Actual Vercel project settings, traffic, deployed bundle sizes, and network timings were not available. Priorities reflect code evidence; speed improvements require before/after measurement. No application code or deployment settings were changed.

## Highest-priority frontend improvements

1. **Remove the blocking backend wake-up screen. Impact: very high; effort: small.**
   - Evidence: `frontend/src/components/providers/BackendWakeupProvider.tsx:85` adds 300 + 350 + 250 ms before its health request and 500 + 800 ms after success: 2.2 seconds of artificial waiting, followed by a 600 ms dismissal delay and an exit animation. It is mounted globally in `frontend/src/app/layout.tsx`.
   - Render the public page immediately. Use local loading/error states for event data and registration actions. Remove startup health polling from the visitor journey.
   - A successful health response does not check Google Sheets, and warming one function instance does not guarantee later requests use it. The current health endpoint only returns process information.
   - Acceptance: a new browser session can read and navigate the homepage while the API is slow or unavailable.

2. **Make the first hero image discoverable in the initial HTML. Impact: high; effort: small.**
   - Evidence: `frontend/src/components/hero/MomentsShowcase.tsx:42` chooses a random slide after mount, and its `hasMounted` branch initially renders a placeholder. The image request therefore waits for hydration. Priority is based on the random image index rather than whether it is the initial visible image.
   - Render a deterministic first slide on the server; rotate after load. Prioritize the actual above-the-fold image if measurement identifies it as the LCP element. Match `sizes` to the roughly 310–360 px card rather than advertising a full viewport on mobile.
   - Also review `PageTransition.tsx`, which starts the entire main content at opacity zero, and hero entrance animations. Keep essential text and imagery visible without waiting for JavaScript animations.

3. **Resize and compress the source photos. Impact: medium to high; effort: small.**
   - Evidence: six files in `frontend/public/moments` total 46,457,863 bytes, approximately 46.5 MB. The largest is `_MG_0503.jpg` at 14.8 MB; `IMG_3169.JPG` is 12.2 MB. They are used in a small carousel.
   - Export appropriately sized WebP/AVIF assets, for example 800–1200 px at the long edge after visual comparison. Keep originals outside deployed assets if needed for archival use.
   - The carousel already uses `next/image`: these source totals are **not** the browser's initial download size. Smaller originals principally reduce source/deployment size and cold image transformation work; measure actual optimized response bytes separately.
   - In `MembersSection.tsx:425`, assess whether all leadership images deserve priority. Lazy-load images below the viewport.

4. **Share public data and avoid duplicate requests. Impact: high; effort: medium.**
   - Evidence: both `FeaturedEvent.tsx:123` and `ActiveEventPopup.tsx:33` fetch the featured event on the events page. `GalleryPreview` separately loads past events from the same Events sheet. Navbar announcements are fetched on each navbar mount.
   - Fetch public event/announcement data once through cached server helpers and pass it to interactive components, or use a client request cache with deduplication and a clear freshness policy.
   - `FeaturedEvent.tsx:89` can fetch registrations once for the initial `"loading"` event ID and again after the real ID arrives if the user is already available. Wait for a valid event ID; consider an authenticated event-specific registration-status endpoint.
   - A shared public route-group layout can preserve Navbar/Footer across navigation. `AnnouncementBanner` has a similar fetch but is not currently imported by the inspected routes; it is not a confirmed active duplicate.

5. **Server-render public content; keep interactive islands small. Impact: high; effort: medium.**
   - Public route files are already Server Components, but most sections are Client Components and live event content loads in effects after hydration. Separate event descriptions, roster data, and static mission/footer markup from forms, menus, and animation controls.
   - Explicitly cache public server data. The current `next.config.ts` does not enable Cache Components: use the installed version's existing fetch/revalidation model, or deliberately adopt Cache Components with appropriate lifetimes and invalidation. Merely moving a request to the server does not make it cached or fast.
   - Keep authenticated data outside shared caches. Avoid stacking multiple long TTLs without coordinating freshness. See the [Next.js caching guide](https://nextjs.org/docs/app/getting-started/caching).

6. **Load optional libraries when needed. Impact: medium; effort: small to medium.**
   - `dashboard/registrations/page.tsx:20` imports `jspdf` and `jspdf-autotable` eagerly. Import them in the export handler.
   - `FeaturedEvent.tsx:7` eagerly imports the payment SDK wrapper. Consider importing it when checkout starts and separating the registration modal from the public event display. The checkout SDK's `load()` call is already deferred until checkout; measure the wrapper's bundle contribution before claiming a large gain.
   - Assess smaller animation boundaries or lazy motion features using a production bundle report. These libraries affect their importing routes; PDF code is not evidence of homepage bundle weight. See [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading).

7. **Reduce continuous animation work and fix listener cleanup. Impact: medium, especially on weaker devices; effort: small to medium.**
   - `AnimatedBackground.tsx` already caps mobile particles and skips mobile connection lines. Preserve those improvements.
   - Its resize listener is an anonymous wrapper, while cleanup removes `resize`; the registered listener remains after unmount. Use the same named callback for registration and removal.
   - Honor reduced motion inside the JavaScript canvas loop, pause nonessential animation when appropriate, and profile the per-frame grid/Set/gradient allocations before further tuning. Existing CSS reduced-motion rules do not stop a JavaScript canvas loop.
   - Coalesce the root layout's mouse-driven CSS updates into animation frames; use motion values/refs for carousel tilt instead of React state updates on every mouse move.

## Highest-priority backend improvements

8. **Cache successful public API responses at the CDN. Impact: very high for repeat traffic; effort: medium.**
   - Evidence: public handlers in `backend/src/controllers/admin.controller.ts:543` read Sheets for every request; `sendResponse` provides no cache policy. The Sheets client singleton caches the API client, not the sheet data.
   - Start with a short, explicitly accepted freshness window for `/announcements`, `/events/featured`, and `/events/past`, such as 30–60 seconds. Use stale-while-revalidate where slightly old public content is acceptable. Consider longer lifetimes for completed events.
   - Keep public routes independent of session mutation, and prevent cookies/authorization from contaminating public cache behavior. `AuthProvider.tsx:31` currently attaches a bearer token to all matching backend URLs; use explicit public and authenticated request helpers instead.
   - Keep auth, registrations, payment, and admin responses private/no-store. Always validate current availability and price on submission. Coordinate invalidation across frontend and backend caches after admin edits; direct Sheet edits need TTL expiry or a separate invalidation mechanism.
   - Some handlers return HTTP 200 with an empty list after upstream failure. Distinguish failures before caching so an outage does not replace valid cached content with an empty response. Confirm hits using `x-vercel-cache` and check CORS behavior from allowed origins. See [Vercel cache headers](https://vercel.com/docs/caching/cache-control-headers) and [cache eligibility](https://vercel.com/docs/caching/cdn-cache).

9. **Reduce repeated Sheets reads and writes. Impact: high; effort: medium.**
   - Event lookups scan `Events!A2:I500`; registration lookups and list operations scan ranges up to `Registrations!A2:Q10000`. Updates often scan again to locate the row.
   - Reuse a request's fetched snapshot and row metadata. Use `values.batchGet` for independent ranges and batch writes where semantics permit. Cache noncritical public reads, with in-flight request deduplication; process-local caches are only opportunistic and must not be used as authoritative state.
   - `admin.controller.ts:443` updates settings sequentially, and each `updateSetting` reads the same settings range. Read once and batch the changed cells.
   - `activity.repository.ts:17` checks sheet existence before every log append. Provision sheets through the existing bootstrap script and remove routine schema checks from request paths. Preserve audit durability when moving logging off the response path.
   - Add bounded timeouts and backoff for safe retryable operations. Avoid indiscriminate write retries, which can duplicate rows. Sheets quotas can make a traffic spike look like server slowness; see [Google Sheets usage limits](https://developers.google.com/workspace/sheets/api/limits).

10. **Move transactional records to an indexed database as usage grows. Impact: very high at scale; effort: large.**
    - Registration duplicate/capacity checks fetch all registrations, filter in memory, then append. Concurrent Vercel invocations can both pass the same check; caching this path does not solve that race.
    - Use a relational database with a unique event/email constraint, indexed registration/payment identifiers, and transactional capacity reservation. Keep Sheets as an export/reporting destination if it is useful to organizers.
    - This removes growing full-sheet scans and permits efficient user/event filtering. Use a serverless-compatible pooled connection strategy and place compute near the database. A migration is a scaling step, not a prerequisite for the immediate frontend/cache fixes.

11. **Paginate dashboard data at the source. Impact: high for large rosters; effort: medium to large.**
    - Admin registrations, members, and activities return complete collections. The registrations page downloads everything and filters/flattens it in the browser; activities read and sort up to 10,000 sheet rows.
    - Add validated page/cursor, event, status, and search parameters; return bounded results and separate summary counts. Render only the requested page or virtualize genuinely large visible lists.
    - Slicing after a full Sheets read only reduces response and rendering cost. Indexed database queries are needed to remove the underlying full-scan cost. Keep complete exports as an explicit separate operation.

12. **Use reliable background email delivery. Impact: reliability and retry reduction; effort: medium.**
    - Payment and admin controllers call `sendRegistrationConfirmationEmail(...).catch(...)` without awaiting or registering background work. Email is already off the response path, so this is not a claim that synchronous email currently dominates response time.
    - For bounded work, register the promise with Vercel `waitUntil`; for durable delivery, enqueue an idempotent job and retry failures. Browser verification and webhook paths can both trigger confirmation, so deduplicate by registration/payment event.
    - Persist the authoritative registration/payment result before reporting success. `waitUntil` extends execution within function limits; it is not a durable queue. See [Vercel function APIs](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package).

13. **Stop relying on instance-local session and rate-limit state. Impact: reliability under scaling; effort: medium.**
    - `backend/src/config/session.ts` configures no shared store; rate limiting also uses its default local store. Bearer-token middleware writes decoded users into sessions even for public requests.
    - Choose a coherent authentication model: shared sessions, or validated token auth with a deliberate expiry/revocation design. Scope auth/session middleware to routes that need it and preserve existing login/logout semantics during migration.
    - Use shared rate-limit state or suitable platform enforcement for sensitive routes. Tune public reads separately from login/registration so normal visitors behind a campus IP are not penalized by the global 100-request window. This is primarily about consistent service and fewer failed/repeated requests, not a proven CPU bottleneck.

## Vercel deployment and measurement

14. **Choose function regions from measured end-to-end latency. Impact: potentially high; effort: small.**
    - `backend/vercel.json` contains only a catch-all rewrite; the repository does not establish the actual region or Fluid Compute setting, which may be configured in the dashboard.
    - For an India-based audience, benchmark Mumbai (`bom1`) against the current region, measuring Sheets/provider time as well as browser-to-API latency. Do not assume the geographically closest region is fastest for Google's upstream APIs.
    - If public rendering begins fetching the backend from Next.js functions, align frontend server execution and backend placement where practical. Static assets remain globally delivered. See [Vercel function regions](https://vercel.com/docs/functions/configuring-functions/region).

15. **Measure cold-start imports and verify Fluid Compute. Impact: conditional; effort: medium.**
    - `backend/api/index.ts` loads the whole Express app. Public handlers share modules with admin/email code, and the route graph includes Google, payment, and email SDKs.
    - Inspect the deployed function trace and initialization timings. Test a narrower Sheets client package and lazy initialization/imports for infrequently used services; compare cold and warm requests. Split public handlers from admin handlers if profiling shows a meaningful startup benefit.
    - Verify Fluid Compute in project settings; it is enabled by default for new projects and provides concurrency/cold-start optimizations. Select a supported Node runtime consistently. Increasing maximum duration is not a speed optimization, and more memory/CPU will not remove Sheets network waits. See [Fluid Compute](https://vercel.com/docs/fluid-compute).

16. **Reduce avoidable cross-origin round trips. Impact: medium; effort: small to medium.**
    - Auth and health GET requests set `Content-Type: application/json` without a body, and bearer headers are globally injected. These can cause CORS preflights across the two Vercel project domains.
    - Remove unnecessary headers from public GETs; configure an appropriate preflight cache lifetime for authenticated calls. An external `/api/*` rewrite through the frontend is an alternative for same-origin browser requests, but benchmark its routing overhead and verify cookie behavior. Do not add a Next.js function proxy just to forward every request.

17. **Add measurements before expanding optimization work. Impact: essential for prioritization; effort: small to medium.**
    - Record mobile LCP, INP, CLS, initial JavaScript/image bytes, and API request count on home/events/members/dashboard. Suggested user-experience targets: p75 LCP under 2.5 seconds, INP under 200 ms, CLS under 0.1; these are targets, not measured results.
    - Record API p50/p95, cold versus warm duration, upstream Sheets request count/duration, 429s, failures, and public CDN hit rate. Add request IDs and safe timing logs without personal data.
    - Compare logged-out and logged-in sessions, direct visits and client navigation, empty and populated caches, and realistic registration bursts in staging. Do not load-test live payment creation or production Sheets indiscriminately.
    - Run production builds and inspect bundles when implementing changes. This documentation-only review did not run builds, synthetic benchmarks, or live deployment tests.

## Suggested implementation order

1. Remove startup blocking; render a stable first hero image; resize source photos.
2. Separate public/authenticated fetches; deduplicate event reads; add public caching with a documented freshness policy.
3. Batch Sheets work; paginate growing lists; defer PDF/modal code; fix animation cleanup.
4. Verify regions/Fluid Compute; improve session/rate-limit/background-job behavior.
5. Migrate transactional records when traffic, latency, quotas, or concurrency requirements justify it.

Keep existing useful choices: `next/font`, `next/image`, the reused Sheets client, mobile particle limits, and parallel registration/event dashboard fetching. Update `docs/DEPLOYMENT.md` when implementing these changes: a 503/504 is not by itself proof of a cold start, and a wake-up screen is not a general remedy for backend failures.
