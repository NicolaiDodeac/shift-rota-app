# 4-on-4-off Shift Rota → Google Calendar

A shareable Next.js app that generates a 4-on/4-off, 12-hour rota with **2 weeks days → 2 weeks nights** rotation, preview it, **push to Google Calendar**, or **subscribe via ICS**.

## Features
- Luxon-based generator — DST-safe for `Europe/London` (and any TZ).
- Parametric config (anchor day, rotation length in weeks, start times, titles).
- Sign in with Google and **upsert** events to your *primary* calendar.
- Alternatively, subscribe to an **ICS feed** (read-only) – no Google sign-in needed.
- Deploy in minutes on **Vercel**.

## Quick Start (Local)
```bash
pnpm i   # or npm i / yarn
cp .env.example .env.local  # fill values
pnpm dev
```
Open http://localhost:3000

## Google OAuth setup
1. Go to Google Cloud Console → Credentials → **Create OAuth Client ID (Web)**.
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your Vercel URL).
3. Put `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into `.env.local`.
4. Add `NEXTAUTH_URL` to your deployed URL, and `NEXTAUTH_SECRET` (random string).

## Deploy on Vercel
- Push this repo to GitHub and “Import Project” on Vercel.
- Add the env vars from `.env.example` in the Vercel dashboard.
- Hit **Deploy**.

## How it works
- **4-on/4-off** is modelled as an 8‑day cycle: days 1–4 ON, 5–8 OFF.
- **2-week rotation** flips ON‑day type (day↔night) every `rotationWeeks*7` days from the anchor ON day.
- Start times and 12h duration are respected across DST via Luxon’s time arithmetic.

## Avoiding duplicates
We compute a deterministic event `id` per date+config and call `events.update`. If not found we `insert`. Re-running with the same config safely overwrites.

## ICS vs Google push
- ICS URL (button) can be shared with colleagues. Each person subscribes in Google Calendar (Settings → Add calendar → From URL).
- Google push requires Google sign-in; it writes events to the user’s **primary** calendar.

## Notes
- Change the default timezone by editing `.env.local` → `DEFAULT_TZ` or the UI.
- If your site will be used by many teams, consider adding per-user named calendars.
- The generator shows the first 100 shifts in the table for speed; all shifts are synced/ICS'ed.

## License
MIT
