# Moonshine Saints

Web app for the band: songs, ChordPro tabs, recordings, gigs/setlists, and threaded messages.
See `claude.md` for the full project context and the `Moonshine_Saints_*.md` docs for specs.

## Tech stack (zero cost, 3 services)

| Layer | Technology | Host |
|-------|-----------|------|
| Frontend | React 18 + Vite | Vercel |
| Backend | Node.js + Express | Render (free tier; cold starts are fine) |
| Database | PostgreSQL | Supabase |
| File storage | Supabase Storage (MP3s, 1GB free) | Supabase |
| Recording links | YouTube URLs stored in the database | — |

## Structure
- `frontend/` — React + Vite (port 5173). `vercel.json` rewrites all routes to `index.html` for client-side routing.
- `backend/` — Express API (port 3000). `src/config/` holds `env.js`, `db.js` (Postgres) and `storage.js` (Supabase Storage).
- `database/` — `schema.sql`, `seed.sql`, and `migrations/` (apply in order to an existing database).

## Local setup
1. Node 18+ (20 recommended).
2. `cp backend/.env.example backend/.env` and fill it in (see below); `cp frontend/.env.example frontend/.env.local`.
3. Run `database/schema.sql`, then `database/seed.sql`, in the Supabase SQL editor.
4. `npm install` from the repo root (installs both workspaces). Don't use `sudo`.
5. `npm run dev` starts API and web together, then open `http://localhost:5173` and check `http://localhost:3000/api/health`.
6. `npm run db:check -w backend` verifies the database connection.

### Backend environment
| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Supabase → Connect → **Session pooler** URI (the direct host is IPv6-only) |
| `JWT_SECRET`, `JWT_EXPIRATION` | 32+ random characters; `7d` |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_KEY` | **service_role** key (Settings → API). Server-only; never expose it to the frontend |
| `SUPABASE_STORAGE_BUCKET` | `recordings` (create it under Storage) |
| `FRONTEND_URL` | Allowed CORS origin: `http://localhost:5173` locally, the Vercel URL in production |

## Deployment
1. **Supabase:** create the project, run `schema.sql`, create the `recordings` storage bucket.
2. **Render:** new Web Service from the repo. Build `cd backend && npm install`, start `node backend/src/server.js`, set the env vars above (`NODE_ENV=production`, `FRONTEND_URL` = Vercel URL).
3. **Vercel:** import the repo, root directory `./frontend`, framework **Vite**, output `dist`, set `VITE_API_URL` to the Render URL.
4. Set `FRONTEND_URL` on Render to the final Vercel URL and redeploy if it changed.

See `SETUP_GUIDE_SIMPLIFIED.md` for the click-by-click walkthrough.

## Status
Songs (with ChordPro tabs), gigs and setlists, and messaging are implemented. Recordings (MP3 upload / YouTube link),
comments on tabs, the home feed and message search are not yet; their endpoints return `501`.
