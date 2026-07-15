# CS-CLUB Backend

Express.js backend for the Cybersecurity Club website.

## Status

This backend is **not yet implemented**. The directory structure is scaffolded and ready for development.

## Planned Stack

- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Authentication**: Google OAuth 2.0
- **Data**: Google Sheets API
- **Hosting**: Render

## Directory Structure

```
src/
  config/       — Environment and service configuration
  controllers/  — Route handler logic
  middleware/   — Auth, CORS, error handling middleware
  routes/       — Express route definitions
  services/     — Google Sheets API service layer
  utils/        — Shared helper utilities
  types/        — TypeScript type definitions
  server.ts     — Application entry point
```

## Getting Started

```bash
# 1. Copy the environment template
cp .env.example .env

# 2. Install dependencies (when implemented)
npm install

# 3. Run the dev server
npm run dev
```
