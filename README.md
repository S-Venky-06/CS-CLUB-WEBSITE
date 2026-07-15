# Cybersecurity Club of GCET — Website

Official website for the Cybersecurity Club at Geethanjali College of Engineering and Technology.

## Project Structure

```
CS-CLUB/
├── frontend/    — Next.js web application (Vercel)
├── backend/     — Express.js API server (Render) [scaffold only]
├── docs/        — Architecture and deployment documentation
├── README.md
├── LICENSE
└── .gitignore
```

## Architecture

```
User
  │
  ▼
Next.js Frontend (Vercel)
  │
  HTTPS API
  ▼
Express Backend (Render)
  │
  Google Sheets API
  ▼
Google Sheets
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (not yet implemented)

```bash
cd backend
# See backend/README.md for setup instructions
```

## Tech Stack

| Layer      | Technology                        | Hosting |
|------------|-----------------------------------|---------|
| Frontend   | Next.js, React, TypeScript, Tailwind CSS, Framer Motion | Vercel |
| Backend    | Express.js, TypeScript            | Render  |
| Auth       | Google OAuth 2.0                  | —       |
| Data       | Google Sheets API                 | —       |

## License

See [LICENSE](./LICENSE) for details.
