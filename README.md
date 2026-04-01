# OpsTrack Web

Frontend client for **OpsTrack**, designed as a tactical operator console and intentionally built to serve the backend rather than overshadow it.

---

## Overview

The OpsTrack web client provides the browser-facing interface for authentication, task visibility, operator management, and audit access. It uses an **Operational Brutalism** visual system: minimal decoration, dense information layout, and high-contrast tactical styling.

This frontend is deliberately positioned as a **control surface for backend validation**. The application exists to exercise the API, visualize protected workflows, and demonstrate role-aware data access in a deployed environment.

## Live Demo

- **Frontend:** [`https://opstrack-web.vercel.app`](https://opstrack-web.vercel.app)
- **API Dependency:** [`https://opstrack.onrender.com`](https://opstrack.onrender.com)

## Demo Access

Use the seeded demo accounts to inspect both interface states:

### Admin Access

- **Email:** `op10@opstrack.mil`
- **Password:** `password123`
- **Role:** `ADMIN`

### Member Access

- **Email:** `op11@opstrack.mil`
- **Password:** `password123`
- **Role:** `MEMBER`

---

## AI-Driven Development Statement

The UI and interaction layer for OpsTrack was **intentionally accelerated with AI-assisted development workflows and custom agent-guided generation**. This was a deliberate architectural choice: automate much of the frontend scaffolding and repetitive interface construction so the primary engineering focus could remain on **backend performance, relational database architecture, authentication, and API security**.

In short, the frontend is not the centerpiece of the portfolio—the backend is. The client exists to expose and validate backend capability in a usable, testable form.

---

## Tech Stack

- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Forms/Validation:** React Hook Form + Zod
- **Data Fetching:** React Query
- **HTTP Client:** Axios
- **Routing:** React Router
- **Deployment:** Vercel

---

## Key Features

### State Synchronization With the REST API

- React Query-driven fetch lifecycle
- server-sourced pagination and sorting for the task dashboard
- API response normalization for resilient UI rendering

### JWT Bearer Token Management

- login saves JWT to local storage
- Axios request interceptor automatically attaches `Authorization: Bearer <token>`
- protected routes redirect when token is missing or expired

### RBAC UI Rendering

- admin-only views remain hidden or inaccessible to non-admin operators
- route protection enforces role-aware navigation
- the interface mirrors backend authorization boundaries instead of bypassing them

### Tactical Operator Console

- mission-themed dashboard layout
- dense, low-decoration information hierarchy
- responsive task table tuned to adapt across different viewport heights

---

## Local Development

### Install

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Set the API base URL:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

### Start the Dev Server

```bash
npm run dev
```

Local frontend URL:

```text
http://localhost:5173
```

---

## Scripts

- `npm run dev` - start Vite dev server
- `npm run typecheck` - TypeScript validation
- `npm run build` - production build
- `npm run preview` - preview built app locally
- `npm run lint` - ESLint checks
- `npm run demo:check` - typecheck + build

---

## Deployment Notes

### Vercel Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Required Environment Variable

```dotenv
VITE_API_BASE_URL=https://<api-domain>/api
```

### Production Wiring

After deploying the frontend, update the API service to allow the frontend origin:

```dotenv
CORS_ORIGIN=https://<frontend-domain>
```

Then redeploy the API.

---

## Verification Checklist

After deployment:

1. Open the Vercel URL
2. Log in with the demo admin account
3. Confirm the task dashboard loads from the deployed API
4. Validate admin-only views such as user management and logs

---

## Troubleshooting

### Network Error on Login

- confirm `VITE_API_BASE_URL` includes `/api`
- confirm API `CORS_ORIGIN` exactly matches the frontend deployment URL
- hard refresh the browser after redeploys

### Redirect Loop to `/login`

- clear local storage
- re-authenticate to issue a fresh token

### Empty or Unexpected Task Layout

- confirm the latest frontend build is deployed
- hard refresh to invalidate old cached assets

---

## Frontend Role in the Portfolio

This client is intentionally lean and operational. Its purpose is to:

- expose backend behavior clearly
- validate auth and RBAC flows end-to-end
- demonstrate production connectivity between Vercel and Render
- provide a polished but secondary UI layer for a backend-focused portfolio project
