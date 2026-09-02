<p align="center">
  <img src="assets/club-logo.png" alt="Cybersecurity Club of GCET Logo" width="380" />
</p>

<h1 align="center">Cybersecurity Club of GCET</h1>

<p align="center">
  <strong>The official web platform and operations management system for the Cybersecurity Club at Geethanjali College of Engineering and Technology (GCET).</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" /></a>
  <a href="https://developers.google.com/sheets/api"><img src="https://img.shields.io/badge/Google_Sheets_API-v4-34A853?style=for-the-badge&logo=google-sheets&logoColor=white" alt="Google Sheets API" /></a>
</p>

<p align="center">
  <a href="#-about-the-club">About</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-license">License</a>
</p>

---

## 🛡️ About the Club

The **Cybersecurity Club of GCET** is a student-driven technical community dedicated to advancing ethical hacking, capture-the-flag (CTF) competitions, reverse engineering, defensive cybersecurity, and secure software development.

This web application serves as the club's central digital hub — featuring member showcases, event registrations, group discussion evaluations, administrative analytics, and automated PDF reporting.

---

## ✨ Key Features

- **⚡ Cyberpunk & Glassmorphic UI**: High-fidelity dark aesthetic engineered with smooth Framer Motion micro-interactions, cyber scanlines, and animated particle mesh backdrops.
- **👥 Interactive Members Directory**:
  - **Leadership**: Club President & Vice Presidents.
  - **Team Leads**: Technical, Design, Logistics, Social Media & Operations Leads.
  - **Core Members**: Dedicated technical operators and coordinators.
  - **Fresh Talent**: Newly onboarded recruits and rising security associates.
  - **Team DDMM (CTF)**: Tournament triumphs, national podium finishes, and competition history.
- **🎟️ Real-Time Event Management**: Live workshop/hackathon registration flow with branch selection, roll number validation, and instant Google Sheets synchronization.
  - **💳 Integrated Payments**: Seamless Manual UPI QR payment flow with 12-digit UTR validation and admin verification for paid event registrations.
- **📊 Admin Command Center**:
  - **Dashboard Overview**: Metrics on registrations, branch distributions, and live activity streams.
  - **GD Management System**: Evaluator interface for group discussions, candidate scoring, and shortlisting.
  - **PDF Export Suite**: Instant branded `.pdf` generation for candidate lists and exportable reports using `jspdf` and `jspdf-autotable`.
- **🔐 Google OAuth 2.0 Authentication**: Secure role-based administrative authentication.

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────┐
                               │       Client / Web      │
                               └────────────┬────────────┘
                                            │
                                            ▼
                          ┌───────────────────────────────────┐
                          │   Next.js 16 App Router (Vercel)  │
                          │   - Dynamic Cyber Components      │
                          │   - Google OAuth Provider         │
                          │   - Manual UPI Flow UI            │
                          └─────────────────┬─────────────────┘
                                            │ HTTPS REST API
                                            ▼
                          ┌───────────────────────────────────┐
                          │      Express + TypeScript API     │
                          │   - Auth & Session Middleware     │
                          │   - Verification Logic            │
                          │   - Google Drive Upload           │
                          │   - Rate Limiting & Winston Logs  │
                          └─────────────────┬─────────────────┘
                                            │ Service Account JWT
                                            ▼
                          ┌───────────────────────────────────┐
                          │     Google Sheets API Database    │
                          │   - Live Registrations Sheet      │
                          │   - Evaluation & Audit Store      │
                          └───────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16 (Turbopack)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism System
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- **Payments**: Manual UPI with UTR validation and admin verification
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Payments**: Manual UPI QR flow (Zero-Dependency)
- **Database & Storage**: [Google Sheets API v4](https://developers.google.com/sheets/api) via Google APIs Client Library
- **Security & Utilities**: `cors`, `helmet`, `express-rate-limit`, `crypto`, `winston`, `dotenv`

---

## 📁 Project Structure

```
CS-CLUB/
├── assets/                          # Static branding & documentation assets
│   └── club-logo.png                # Official Cybersecurity Club Logo
├── frontend/                        # Next.js web application
│   ├── public/                      # Public media assets (members, logos, etc.)
│   │   ├── members/                 # Member portraits (leadership, core, talent)
│   │   ├── club-logo.png            # Club logo
│   │   └── college-logo.png         # GCET college logo
│   ├── src/
│   │   ├── app/                     # App router pages (Home, Members, Events, Dashboard)
│   │   ├── components/              # Reusable UI components
│   │   │   ├── background/          # Animated particle canvas
│   │   │   ├── dashboard/           # Admin dashboard modules & GD tables
│   │   │   ├── layout/              # Navbar, Footer & Navigation
│   │   │   └── sections/            # MembersSection, FeaturedEvent, TeamDDMMShowcase
│   │   ├── lib/                     # API client utilities & report generators
│   │   └── types/                   # Frontend TypeScript interfaces
│   └── package.json
├── backend/                         # Express.js API server
│   ├── src/
│   │   ├── config/                  # Google Sheets credentials & environment configs
│   │   ├── controllers/             # Request handlers
│   │   ├── middleware/              # Auth, validation, and error middlewares
│   │   ├── repositories/            # Google Sheets data access layers
│   │   ├── routes/                  # API route definitions
│   │   ├── services/                # Business logic (Registrations, GD, Analytics)
│   │   ├── utils/                   # Logger & helper functions
│   │   └── server.ts                # Application entrypoint
│   └── package.json
├── docs/                            # Architecture & deployment docs
├── README.md                        # Master repository documentation
└── LICENSE                          # MIT License
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **pnpm**
- Google Cloud Service Account credentials (for Google Sheets backend)

---

### 1. Clone the Repository
```bash
git clone https://github.com/S-Venky-06/CS-CLUB-WEBSITE.git
cd CS-CLUB
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Start the development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### 3. Backend Setup

```bash
cd ../backend
npm install
```

Configure your `.env` file inside the `backend` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

# Google Sheets Config
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ─── Google Drive (Screenshot Storage) ───────────────────
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

Start the backend server:
```bash
npm run dev
```
The API server will listen at **[http://localhost:5000](http://localhost:5000)**.

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

---

<p align="center">
  <strong>Cybersecurity Club • Geethanjali College of Engineering and Technology</strong><br />
  Securing the Future, One Byte at a Time. 🔒
</p>
