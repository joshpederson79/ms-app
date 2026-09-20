# Moonshine Saints

Web app for the band: songs, ChordPro tabs, recordings, gigs/setlists, and threaded messages.
See `claude.md` for the full project context and the `Moonshine_Saints_*.md` docs for specs.

## Structure
- `frontend/` — React 18 + Vite (port 5173)
- `backend/` — Node + Express API (port 3000)
- `database/` — `schema.sql` and `seed.sql` (run in the Supabase SQL editor)

## Setup
1. Node 20+.
2. `cp backend/.env.example backend/.env` and `cp frontend/.env.example frontend/.env.local`, then fill in values.
3. Run `database/schema.sql`, then `database/seed.sql`, against your Postgres/Supabase database.
4. `npm install` (from the repo root, installs both workspaces).
5. `npm run dev` starts API and web together. Check `http://localhost:3000/api/health`.

## Status
Auth (signup/login/verify-token) and the ChordPro parser are implemented. All other endpoints return `501` and
all pages are placeholders; see the API list in `claude.md`.
