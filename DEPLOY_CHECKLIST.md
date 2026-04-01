# OpsTrack Web Lightweight Deploy Checklist

Use this when deploying the frontend for portfolio/demo purposes.

## 1. Prerequisites

1. Push `OpsTrack-web` to GitHub.
2. Confirm local checks pass:
   - `npm run demo:check`
3. Ensure API is already deployed and reachable.

## 2. Configure Environment

1. Copy `.env.example` to `.env` for local use if needed.
2. Set this in your hosting provider (Vercel/Netlify):
   - `VITE_API_BASE_URL=https://<api-domain>/api`

## 3. Deploy Frontend (Vercel recommended)

Use these settings:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## 4. Verify Frontend Deployment

1. Open your frontend URL.
2. Log in with seeded credentials.
3. Verify key flows:
   - View tasks dashboard
   - Create and patch a task
   - Admin-only pages visible only to admin
   - User creation available from admin sidebar

## 5. Production Wiring Check

1. In API hosting, set:
   - `CORS_ORIGIN=<frontend-url>`
2. Redeploy API after updating `CORS_ORIGIN`.
3. Re-test login and protected requests from browser.

## 6. Troubleshooting

1. Network errors from frontend:
   - Check `VITE_API_BASE_URL` value includes `/api`.
2. CORS errors in browser console:
   - Verify API `CORS_ORIGIN` matches frontend domain exactly.
3. Login loop to `/login`:
   - Clear local storage and verify API 401/200 behavior.
