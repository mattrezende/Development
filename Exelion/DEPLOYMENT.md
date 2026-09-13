# Deploying Exelion

Exelion is a single Node.js application: Express serves both the JSON API (under `/api`) and
the built React frontend (static files + SPA fallback) from one process. There is no separate
frontend host and no PocketBase — data lives in MongoDB Atlas.

```
apps/
├── web/   React + Vite SPA — built to ../../dist/apps/web, served by apps/api in production
└── api/   Express API + static file server — the only thing that actually runs in production
```

## 1. MongoDB Atlas

1. Create a free/shared cluster at https://www.mongodb.com/cloud/atlas.
2. Database Access → add a database user (username/password, read/write on the target database).
3. Network Access → add an IP allow-list entry. Hostinger shared hosting doesn't publish a
   fixed outbound IP, so allow `0.0.0.0/0` (all IPs) and rely on the database username/password
   for security, unless your plan gives you a static IP to allow instead.
4. Get the connection string ("Connect" → "Drivers") — this is your `MONGODB_URI`.

## 2. Environment variables

Copy `apps/api/.env.example` and fill in real values. In production these are set directly in
Hostinger's hPanel (Node.js app → Environment variables), not committed to git:

- `MONGODB_URI` — from step 1
- `JWT_SECRET` — long random string, e.g. `openssl rand -hex 64`
- `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PUBLIC_KEY`, `MERCADO_PAGO_WEBHOOK_SECRET` — from your Mercado Pago dashboard
- `WEBHOOK_URL`, `FRONTEND_URL`, `CORS_ORIGIN` — all set to your production domain, e.g. `https://exelion.com.br`
- `PORT` — Hostinger's Node.js App Manager usually assigns/expects this; check what it sets and mirror it here if needed
- `NODE_ENV=production`

**Rotate the Mercado Pago access token before going live** — the one in the old
`apps/api/.env.production` working file predates this migration and shouldn't be reused as-is.

## 3. Hostinger hPanel — Node.js App Manager

1. hPanel → Advanced → Node.js → Create Application.
2. Node.js version: use the version pinned in `.nvmrc` (currently 22).
3. Application root: the repo root (contains `package.json` with the `apps/*` workspaces).
4. Application startup file: `apps/api/src/main.js`.
5. Connect the app's domain/subdomain to this Node.js application.
6. Set the environment variables from step 2 in the app's environment variable panel.

## 4. Connect GitHub and deploy

1. hPanel → Advanced → Git → create a repository pointing at your GitHub repo (or use the
   Node.js app's built-in Git deploy panel if offered on your plan) and the branch to deploy
   (e.g. `main`).
2. After the first pull, open the app's Node.js terminal (hPanel provides a browser SSH/terminal
   for Node.js apps) and run:
   ```bash
   npm install
   npm run build --prefix apps/web
   ```
   This installs both workspaces and builds the frontend to `dist/apps/web`, which
   `apps/api/src/main.js` serves directly — no separate static hosting needed.
3. Restart the Node.js application from hPanel so it picks up the new code and env vars.
4. On every subsequent push: pull the latest commit (manually via hPanel's "Deploy"/"Sync" button,
   or a webhook if your plan supports auto-deploy), then re-run `npm install && npm run build --prefix apps/web`
   and restart the app. There is no CI pipeline in this repo — deploys are pull + build + restart.

## 5. First-boot verification

- `GET https://<your-domain>/api/health` → `{ status: 'ok', mongoConnected: true, ... }`
- Load the site root → the built SPA should render (confirms static serving + SPA fallback work).
- Sign up a test teacher account, log in, create a schedule, and confirm the public booking page
  at `/professor/<teacherId>` shows it.
- Do a Mercado Pago sandbox/test payment end-to-end and confirm the webhook (`/api/mercado-pago/webhook`,
  which you must also register as the notification URL in your Mercado Pago app settings) marks the
  enrollment `approved` and the schedule `Ocupado`.

## Known gaps (intentionally out of scope for this migration)

- **Email is not implemented.** The old PocketBase hook that emailed teachers on new enrollments
  relied on Hostinger Horizons' platform-specific mail relay, which doesn't exist once you're off
  that platform. In-app notifications (the `notifications` collection) still work; outbound email
  (password reset, enrollment emails) was deliberately deferred — `POST /api/auth/password-reset`
  currently returns `501 Not Implemented`. Wire up a provider (SMTP, Resend, SendGrid, etc.) via
  `nodemailer` when you're ready.
- **File uploads are stored on local disk** (`apps/api/uploads/`), not in git and not in MongoDB.
  This persists across deploys on Hostinger's Node.js hosting the same way any app-local folder
  does, but if you ever move to a platform with an ephemeral filesystem, switch to object storage.
