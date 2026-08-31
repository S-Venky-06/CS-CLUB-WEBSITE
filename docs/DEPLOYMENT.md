# Deployment Guide

This document provides step-by-step instructions for deploying both the frontend (Next.js) and backend (Express.js) of the Cybersecurity Club website.

---

## Prerequisites

- **Node.js:** v18.x or higher
- **npm** (or pnpm)
- **Vercel Account:** [vercel.com](https://vercel.com) (free tier is sufficient)
- **Google Cloud Project** with:
  - Google Sheets API enabled
  - A Service Account with Editor access to the target spreadsheet
  - An OAuth 2.0 Client ID for web application
- **GitHub Repository:** Code pushed to `github.com/S-Venky-06/CS-CLUB-WEBSITE`

---

## 1. Google Cloud Setup

### 1.1 Create a Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **IAM & Admin → Service Accounts**.
3. Click **Create Service Account**.
4. Name it (e.g., `cs-club-sheets-service`).
5. Grant it no project-level roles (it only needs Sheet-level access).
6. Click **Done**, then click on the new service account.
7. Go to the **Keys** tab → **Add Key → Create new key → JSON**.
8. Download the JSON file. This is your `GOOGLE_SERVICE_ACCOUNT` value.

### 1.2 Share the Google Sheet
1. Open your target Google Spreadsheet.
2. Click **Share** and add the service account's email (e.g., `cs-club-sheets-service@your-project.iam.gserviceaccount.com`) as an **Editor**.

### 1.3 Create an OAuth Client ID
1. In Google Cloud Console, go to **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth Client ID**.
3. Application type: **Web application**.
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-frontend-domain.vercel.app` (production)
5. Copy the **Client ID**. This is your `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`.

---

## 2. Backend Deployment (Vercel)

The backend is deployed as Vercel Serverless Functions using the `vercel.json` configuration which rewrites all incoming requests to the `/api` entry point.

### 2.1 Project Setup

1. In the Vercel dashboard, click **Add New → Project**.
2. Import the GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Framework Preset: **Other** (Express is not a Vercel-native framework).
5. Build Command: `npm run build`
6. Output Directory: `dist`

### 2.2 Environment Variables

Configure the following environment variables in the Vercel dashboard under **Settings → Environment Variables**:

| Variable | Description | Example |
|:---|:---|:---|
| `PORT` | Server port (Vercel ignores this, but needed for local dev) | `5000` |
| `NODE_ENV` | Runtime environment | `production` |
| `SESSION_SECRET` | Secure random string, at least 32 characters | `a-very-long-random-secret-string-here` |
| `FRONTEND_URL` | Production frontend URL(s), comma-separated | `https://cs-club.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `651216...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-...` |
| `ADMIN_EMAILS` | Comma-separated admin emails | `cybersecurityclub@gcet.edu.in` |
| `SUPER_ADMIN_EMAILS` | Comma-separated super admin emails | `admin@gmail.com` |
| `GOOGLE_SERVICE_ACCOUNT` | Full JSON string of the service account key (single-quoted in `.env`, raw in Vercel) | `{"type":"service_account",...}` |
| `GOOGLE_SPREADSHEET_ID` | The ID from your Google Sheet URL | `1AH8VCeB9w7cBReXuWDHNecQZoEDyirTUBOWrr9QSCls` |

> **⚠️ Important:** When pasting `GOOGLE_SERVICE_ACCOUNT` into Vercel, paste the raw JSON object **without** the surrounding single quotes. In your local `.env` file, wrap it in single quotes.

### 2.3 Verify Deployment

After deploying, visit:
- `https://your-backend.vercel.app/` → Should return `"CS-CLUB Backend API is online and running."`
- `https://your-backend.vercel.app/api/v1/health` → Should return `"OK"`

---

## 3. Frontend Deployment (Vercel)

### 3.1 Project Setup

1. In the Vercel dashboard, click **Add New → Project**.
2. Import the same GitHub repository (or create a separate project).
3. Set the **Root Directory** to `frontend`.
4. Framework Preset: **Next.js** (auto-detected).
5. Build Command: `npm run build` (default).
6. Output Directory: `.next` (default).

### 3.2 Environment Variables

| Variable | Description | Example |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | The backend's production URL | `https://your-backend.vercel.app` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID (same as backend) | `651216...apps.googleusercontent.com` |

### 3.3 Verify Deployment

Visit your frontend URL. You should see the full Cyberpunk-themed homepage with:
- Animated particle background
- Hero section
- Members showcase
- Featured event section

---

## 4. Custom Domain Setup (Optional)

### 4.1 Frontend Domain
1. In the Vercel project settings, go to **Domains**.
2. Add your custom domain (e.g., `csclub.gcet.edu.in`).
3. Vercel will provide DNS records (CNAME or A record).
4. Add these records in your domain registrar's DNS settings.
5. Wait for DNS propagation (usually 5-30 minutes).

### 4.2 Backend Domain
1. Repeat the same process for the backend project.
2. Use a subdomain like `api.csclub.gcet.edu.in`.
3. Update the frontend's `NEXT_PUBLIC_API_URL` to point to the new domain.

### 4.3 Update Google OAuth
After setting up custom domains, update the **Authorized JavaScript Origins** in your Google Cloud OAuth Client to include the new frontend domain.

### 4.4 Update CORS
Update the backend's `FRONTEND_URL` environment variable to include the new frontend domain.

---

## 5. CI/CD Pipeline

Vercel provides **automatic deployments** out of the box when connected to a GitHub repository:

| Trigger | Action |
|:---|:---|
| Push to `main` branch | Production deployment |
| Push to any other branch | Preview deployment (unique URL) |
| Pull Request opened | Preview deployment with PR comments |

### Branch Protection (Recommended)
1. Go to GitHub → Repository Settings → Branches.
2. Add a branch protection rule for `main`:
   - Require pull request reviews before merging.
   - Require status checks to pass (Vercel build).

---

## 6. Local Development

### Backend
```bash
cd backend
npm install
# Copy .env.example to .env and fill in credentials
npm run dev
# Server starts at http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# Copy .env.example to .env.local and fill in credentials
npm run dev
# App starts at http://localhost:3000
```

### Initialize Google Sheets Database
If starting with a fresh spreadsheet, run the bootstrap script to create all required worksheet tabs:
```bash
cd backend
npm run init-db
```

---

## 7. Troubleshooting

| Problem | Solution |
|:---|:---|
| CORS errors in browser console | Verify `FRONTEND_URL` env var includes the correct frontend origin (no trailing slash) |
| Google Sheets API 403 | Ensure the service account email is added as an Editor to the spreadsheet |
| OAuth login fails | Verify `GOOGLE_CLIENT_ID` matches between frontend and backend, and authorized origins include your domain |
| Backend returns 503/504 on Vercel | Serverless function cold start. The `BackendWakeupProvider` on the frontend pings the backend to warm it up. Increase function memory if needed. |
| Session not persisting across requests | In production, ensure `SESSION_SECRET` is set and `trust proxy` is enabled (already configured in `app.ts`) |
| Rate limit hit during development | The global limiter allows 100 requests per 15 minutes. Restart the dev server to reset. |
