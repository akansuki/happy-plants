# 🪴 Happy Plants

A simple, mobile-first PWA to keep track of watering and fertilizing your houseplants. Share a single household with your partner so you both see the same plants.

## Stack

- **Next.js 16** (App Router) + TypeScript + React 19
- **Tailwind CSS v4** for styling
- **Auth.js v5** (NextAuth) with Google sign-in
- **Prisma 6** + **PostgreSQL** (Neon)
- **Vercel Blob** for plant photos
- **Vercel Cron** for 60-day care-event cleanup

## Local setup

```bash
# 1. Install deps
npm install

# 2. Configure environment
cp .env.example .env.local
#   — fill in DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID / SECRET, BLOB_READ_WRITE_TOKEN

# 3. Push the schema to your DB
npm run db:push

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Name | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon → create project → copy the **pooled** connection string |
| `AUTH_SECRET` | Run `npx auth secret` (or any random 32-byte base64 string) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → APIs & Services → Credentials → OAuth client ID (web app) |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard → Storage → Create **Blob** store (auto-injects on deploy) |
| `CRON_SECRET` | Any random string. Used to authorize the cleanup endpoint. |

### Google OAuth — authorized redirect URIs

Add **both** of these in the Google Cloud Console under your OAuth client:

- `http://localhost:3000/api/auth/callback/google` (local dev)
- `https://YOUR-DOMAIN.vercel.app/api/auth/callback/google` (production)

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** from your repo.
3. Add the env vars above under **Settings → Environment Variables**.
4. Add a **Blob** store under **Storage** (the token is set automatically).
5. Add a Neon database (via the Neon integration) — `DATABASE_URL` is set automatically.
6. Deploy. The first build runs `prisma generate && next build`.
7. After the first deploy, run a one-time DB migration:
   ```bash
   # locally, pointing at the production DB
   DATABASE_URL="<your prod url>" npm run db:push
   ```
8. Cron is already configured in `vercel.json` — daily 04:00 UTC cleanup.

## How sharing works (whitelist invites)

1. You sign in with Google. The first sign-in auto-creates a household named "Your name's plants" and puts you in it.
2. Open **Settings → Invite by email**, type your partner's Gmail.
3. They go to the same Vercel URL, click **Continue with Google**, and on first sign-in they auto-join your household. No invitation email is sent — just share the URL.

If they already had an account, inviting them moves them into your household immediately.

## Data retention

Care events older than **60 days** are deleted nightly by `/api/cron/cleanup` (protected by `CRON_SECRET`). Plants and household data are never auto-deleted.

## Project structure

```
src/
├── app/
│   ├── actions/          # Server actions (plants, household)
│   ├── api/
│   │   ├── auth/         # NextAuth handlers
│   │   └── cron/cleanup/ # 60-day care event purge
│   ├── plants/
│   │   ├── new/          # Add plant form
│   │   └── [id]/         # Detail + edit
│   ├── settings/         # Household, members, invites
│   ├── signin/
│   └── page.tsx          # Plants list (home)
├── components/           # UI building blocks
├── lib/                  # prisma client, session helpers, utils
├── types/                # next-auth.d.ts (session type augmentation)
├── auth.ts               # NextAuth config + signIn callback (whitelist invites)
└── middleware.ts         # Redirects unauthed users to /signin
prisma/
└── schema.prisma         # User, Account, Session, Household, Invitation, Plant, CareEvent
```
