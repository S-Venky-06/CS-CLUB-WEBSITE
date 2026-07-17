# CS-CLUB Backend

Production-ready Express.js + TypeScript backend foundation for the Cybersecurity Club website.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Start the development server (with hot-reload)
npm run dev

# 4. Test the health endpoint
curl http://localhost:5000/api/v1/health
```

## Available Scripts

| Script          | Command              | Description                                |
|-----------------|----------------------|--------------------------------------------|
| `npm run dev`   | `tsx watch`          | Start dev server with hot-reload           |
| `npm run build` | `tsc`                | Compile TypeScript to `dist/`              |
| `npm start`     | `node dist/server.js`| Run the compiled production build          |
| `npm run clean` | `rimraf dist`        | Remove the `dist/` build output            |
| `npm run lint`  | `eslint src/`        | Lint all source files                      |

## Project Structure

```
backend/
├── src/
│   ├── config/               — Environment & server configuration
│   │   ├── environment.ts       Typed env variable access
│   │   ├── server.ts            CORS, rate-limit, morgan config
│   │   └── index.ts             Barrel export
│   │
│   ├── constants/            — Application-wide constants
│   │   ├── httpStatus.ts        HTTP status codes
│   │   └── index.ts
│   │
│   ├── controllers/          — Route handler logic
│   │   ├── health.controller.ts Health check endpoint
│   │   └── index.ts
│   │
│   ├── middleware/            — Express middleware
│   │   ├── errorHandler.ts      Global error handler
│   │   ├── notFoundHandler.ts   404 catch-all
│   │   └── index.ts
│   │
│   ├── routes/               — Express route definitions
│   │   ├── v1.routes.ts         /api/v1/* endpoints
│   │   └── index.ts             Root /api router
│   │
│   ├── services/             — Service layer (future)
│   │   └── index.ts
│   │
│   ├── types/                — TypeScript type definitions
│   │   ├── api.ts               ApiResponse / ApiErrorResponse
│   │   └── index.ts
│   │
│   ├── utils/                — Shared utilities
│   │   ├── ApiError.ts          Custom error class
│   │   ├── asyncHandler.ts      Async route wrapper
│   │   ├── sendResponse.ts      Standard response helper
│   │   └── index.ts
│   │
│   ├── validators/           — Zod validation middleware
│   │   ├── validate.ts          Schema validation factory
│   │   └── index.ts
│   │
│   ├── logs/                 — Log file output (gitignored)
│   │
│   ├── app.ts                — Express app configuration
│   └── server.ts             — Server startup + graceful shutdown
│
├── .env.example              — Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

| Method | Endpoint           | Description          | Auth Required |
|--------|--------------------|----------------------|---------------|
| GET    | `/api/v1/health`   | Server health check  | ❌ No          |
| POST   | `/api/v1/auth/google`| Google token exchange | ❌ No          |
| GET    | `/api/v1/auth/me`  | Fetch user profile   | ✅ Yes         |
| POST   | `/api/v1/auth/logout`| Terminate session    | ✅ Yes         |
| POST   | `/api/v1/registrations`| Register for an event| ✅ Yes         |
| GET    | `/api/v1/registrations/me`| Get user registrations| ✅ Yes         |

### Health Check Response

```json
{
  "success": true,
  "message": "Backend Running",
  "data": {
    "version": "1.0.0",
    "uptime": 42.123,
    "timestamp": "2026-07-16T04:28:18.541Z"
  }
}
```

## Standard Response Format

All API endpoints follow this envelope:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null
}
```

## Security

- **Helmet** — Sets secure HTTP headers
- **CORS** — Restricted to frontend origin with `credentials: true`
- **Rate Limiting** — Global limits (100 requests / 15 mins) + strict auth limits (10 requests / 1 min)
- **Session Protection** — httpOnly, secure, and SameSite session cookies
- **Session Fixation** — Sessions are regenerated upon successful authentication
- **Body Limits** — 10kb max JSON/URL-encoded payloads
- **x-powered-by** — Disabled

## Environment Variables

See [.env.example](.env.example) for the complete list.

## Future-Ready Architecture

The following features can be added without changing the existing structure:

- **Google Sheets API** → Add to `services/`
- **Admin Dashboard** → Add to `controllers/` and `routes/` using `requireRole` middleware
- **Members / Events / Registration** → Add controllers, routes, and validators

