# claude.md — Moonshine Saints Application Context

## Project Overview

**Moonshine Saints** is a web application for an outlaw country band (6 members) to centralize content management and team communication. It replaces fragmented group texts and scattered file storage with a dedicated platform for songs, tabs, recordings, gigs, and messaging.

**Owner/Developer:** Josh (sole developer, full-time day job, part-time on this project)

**Current Phase:** MVP Development (zero-cost tech stack)

**Timeline:** Part-time project; no hard deadline

---

## Core Requirements (What to Build)

### 1. Content Management

**Songs:**
- Title, lead singer (or "duet"), songwriting credits, status (WIP/Final)
- One set of lyrics per song; chords versioned separately

**Tabs (Chord Charts):**
- ChordPro format input (.txt files uploaded by users)
- Display as **chords positioned OVER lyrics** in monospace font
  - Chord line (copper #A0714F) above lyric line (white #E8E8E8)
  - Organized by section (Verse, Chorus, Bridge, etc.)
- Metadata: capo, tuning, key, tempo, lead singer
- **Versioning:**
  - Major versions: new arrangement or significant update
  - Minor versions: inline chord/capo/tempo edits
  - One recording (MP3 or YouTube link) per tab version

**Permissions by Role:**
- **Song Writer:** Controls lyrics only; others can comment but not edit lyrics
- **Gig Lead:** Create/manage gigs and setlists (multiple allowed per band)
- **All Members:** Edit chords, key, tempo, capo; add comments; upload tab versions

### 2. Gig Management

- Gig = date + venue + setlist
- Setlist: drag-drop reordering, only Final songs displayed
- Song order varies per gig; arrangements do not
- View upcoming and past gigs

### 3. Communication

- Threaded conversations (resolvable/dismissable)
- Searchable messages
- Band-related only (no off-topic chat)
- Comments on tabs (resolvable)

### 4. Authentication & Onboarding

- Invite code → auto-join → admin assigns role
- Simple flow: Welcome → Sign-up → Confirmation
- No social login; email + password only
- JWT token-based session (token in localStorage, refresh on page load)

### 5. Recording Management

- One recording per tab version
- Upload MP3 or link YouTube video
- Player in-app; streaming from Cloudinary or YouTube

---

## Design System

### Colors
```
Background:     #0F1419 (page), #1B2D3D (cards)
Copper Accent:  #A0714F (buttons, chords, highlights, borders)
Cream:          #D4C5A0 (headings, band identity)
Silver:         #C0C0C0 (secondary accents, duet badges)
Border:         #4A5D73
Text Primary:   #E8E8E8
Text Secondary: #999
Text Muted:     #666
```

### Typography
- **Headings:** Georgia serif (band identity, warmth)
- **UI:** System sans-serif (readability, performance)
- **Code/Chords:** Monospace font (alignment)

### Design Tokens
- Spacing: 8px base unit (8, 16, 24, 32, 40px)
- Border radius: 4px (cards, buttons)
- Shadows: Minimal; rely on color hierarchy
- Focus states: Copper border (#A0714F)

---

## MVP Screens (13 Total)

### Onboarding (3 screens)
1. **Welcome** — Invite code input
2. **Sign-up** — Name, email, password
3. **Success** — Confirmation + redirect to home

### App (10 screens)
4. **Home Feed (Onboarding)** — Empty state with call-to-action
5. **Home Feed (Full)** — Mixed activity feed (recent songs, gigs, messages)
6. **Songs List** — Browse, search, filter by singer/status
7. **Song Detail** — Chords-over-lyrics, recording player, comments
8. **Upload Song** — ChordPro upload, metadata, recording
9. **Gigs List** — Upcoming/past gigs with dates
10. **Gig Detail** — Venue, date, setlist builder (drag-drop)
11. **Create Gig** — Date, venue, name
12. **Messages** — Threaded chat with search
13. **Settings** — Profile, role, preferences, sign out

---

## Tech Stack (Zero-Cost MVP)

| Layer | Technology | Cost | Notes |
|-------|-----------|------|-------|
| Frontend | React 18 + Vite | $0 | SPA, fast build, hot reload |
| Backend | Node.js + Express | $0 | Lightweight, JavaScript all the way |
| Database | PostgreSQL on Supabase | $0 | Free tier: 500MB storage, no auth needed for MVP |
| File Storage | Cloudinary | $0 | 25GB/month free, no watermarks |
| Frontend Hosting | Vercel | $0 | Auto-deploy on push, serverless |
| Backend Hosting | Railway | $0 | Free $5 monthly credit (sufficient for MVP) |
| **Total** | | **$0/month** | |

### Dependencies (Minimal, No Bloat)

**Frontend:**
- `react`, `react-dom` — UI framework
- `vite` — Bundler
- `axios` — HTTP client
- `react-hook-form` — Form state
- `react-router-dom` — Routing (add when needed)

**Backend:**
- `express` — HTTP server
- `pg` — PostgreSQL driver
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `dotenv` — Environment variables
- `cors` — Cross-origin requests
- `multer` — File uploads
- `cloudinary` — File upload API
- `zod` — Input validation

---

## Database Schema (Core Tables)

```sql
users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT (songwriter, gig_lead, member),
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
)

songs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lead_singer_id INT REFERENCES users,
  songwriters TEXT[] (JSON array of user IDs for credits),
  status TEXT (WIP, Final),
  created_at TIMESTAMP DEFAULT NOW()
)

tabs (
  id SERIAL PRIMARY KEY,
  song_id INT REFERENCES songs,
  version_number INT,
  is_minor_edit BOOLEAN,
  capo INT,
  tuning TEXT,
  key TEXT,
  tempo INT,
  chorpro_source TEXT (raw user input),
  display_format JSONB (parsed, cached output for rendering),
  created_by INT REFERENCES users,
  created_at TIMESTAMP DEFAULT NOW()
)

recordings (
  id SERIAL PRIMARY KEY,
  tab_id INT REFERENCES tabs,
  file_url TEXT,
  file_type TEXT (mp3, youtube),
  duration_seconds INT,
  uploaded_by INT REFERENCES users,
  created_at TIMESTAMP DEFAULT NOW()
)

gigs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  venue TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  created_by INT REFERENCES users,
  created_at TIMESTAMP DEFAULT NOW()
)

setlist_items (
  id SERIAL PRIMARY KEY,
  gig_id INT REFERENCES gigs,
  song_id INT REFERENCES songs,
  position INT (order in setlist),
  created_at TIMESTAMP DEFAULT NOW()
)

messages (
  id SERIAL PRIMARY KEY,
  thread_id INT REFERENCES messages (NULL for root),
  content TEXT NOT NULL,
  sender_id INT REFERENCES users,
  parent_message_id INT REFERENCES messages,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)

comments (
  id SERIAL PRIMARY KEY,
  tab_id INT REFERENCES tabs,
  content TEXT NOT NULL,
  commenter_id INT REFERENCES users,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## ChordPro Parser Specification

### Input Format
User uploads raw ChordPro text file:
```
[Verse 1]
[E]Well I've been drinking whiskey [B7]all night long
[E]Thinking 'bout you baby, [A]singing this sad song
```

### Output Format
Rendered display (what user sees):
```
Verse 1

E                    B7
Well I've been drinking whiskey all night long

E              A
Thinking 'bout you baby, singing this sad song
```

### Processing Steps
1. **Parse:** Extract section headers (`[Verse 1]`, `[Chorus]`, etc.) and chord positions
2. **Validate:** Check chord names against supported list; warn on unrecognized chords
3. **Calculate Offsets:** For each chord, determine horizontal position above lyric
4. **Render Two Lines:** 
   - Chord line (copper, monospace, aligned)
   - Lyric line (white, monospace, exact)
5. **Cache:** Store both raw ChordPro (for editing) + parsed JSONB (for display)

### Supported Sections
- Verse, Verse 1, Verse 2, etc.
- Chorus
- Pre-Chorus
- Bridge
- Intro, Outro
- Interlude

### Implementation Location
`backend/src/utils/parseChordPro.js` → called in POST /api/songs/:id/tabs

---

## API Endpoints (Summary)

### Auth
```
POST   /api/auth/signup           (name, email, password, invite_code)
POST   /api/auth/login            (email, password)
POST   /api/auth/logout           (client-side: clear localStorage)
POST   /api/auth/verify-token     (token) → {user, exp}
```

### Songs
```
GET    /api/songs                 (filter: singer, status, search)
POST   /api/songs                 (name, lead_singer_id, songwriters, status)
GET    /api/songs/:id             (full song detail)
PATCH  /api/songs/:id             (name, lead_singer, status)
DELETE /api/songs/:id             (songwriters only)

GET    /api/songs/:id/tabs        (all versions of a song's tabs)
POST   /api/songs/:id/tabs        (upload ChordPro, metadata)
GET    /api/tabs/:id              (single tab detail)
PATCH  /api/tabs/:id              (edit chords, capo, tempo, key)
GET    /api/tabs/:id/versions     (tab version history)

POST   /api/tabs/:id/recording    (upload MP3 or YouTube link)
GET    /api/tabs/:id/recording    (fetch recording metadata)
DELETE /api/tabs/:id/recording
```

### Gigs
```
GET    /api/gigs                  (upcoming & past, sorted by date)
POST   /api/gigs                  (create: name, venue, date, time)
GET    /api/gigs/:id              (gig detail + setlist)
PATCH  /api/gigs/:id              (edit: venue, date, time)
DELETE /api/gigs/:id              (gig lead only)

GET    /api/gigs/:id/setlist      (current setlist)
POST   /api/gigs/:id/setlist      (add song)
PATCH  /api/gigs/:id/setlist/:itemId (reorder: change position)
DELETE /api/gigs/:id/setlist/:itemId (remove song)
```

### Messages
```
GET    /api/messages              (search, filter by resolved)
POST   /api/messages              (create thread or reply)
GET    /api/messages/:threadId    (get thread + replies)
PATCH  /api/messages/:id          (mark resolved/unresolved)
DELETE /api/messages/:id          (delete message)
```

### Comments
```
GET    /api/tabs/:id/comments
POST   /api/tabs/:id/comments     (create comment on tab)
PATCH  /api/comments/:id          (mark resolved)
DELETE /api/comments/:id
```

---

## Frontend Architecture

### Routing (React Router)
```
/                    → Redirect based on auth state
/onboarding/invite   → Welcome (invite code)
/onboarding/signup   → Sign-up
/onboarding/success  → Success confirmation
/app/home            → Home feed
/app/songs           → Songs list
/app/songs/:id       → Song detail
/app/upload          → Upload song form
/app/gigs            → Gigs list
/app/gigs/:id        → Gig detail + setlist builder
/app/gigs/create     → Create gig
/app/messages        → Messages
/app/settings        → Settings
```

### State Management
- **Auth:** React Context + localStorage (token)
- **Songs:** Context or local state (fetch on page load)
- **Gigs:** Context or local state
- **Messages:** Fetch on demand
- **Forms:** React Hook Form (minimal dependencies)

### Component Patterns
- **Functional components** with hooks
- **Custom hooks** for data fetching (useSongs, useGigs, useMessages)
- **Error boundaries** for crash handling
- **Controlled inputs** for forms
- **CSS modules or global CSS** (no CSS-in-JS bloat)

### Styling Approach
- Global CSS with CSS variables for colors/fonts
- Monospace font for chords display (preserve alignment)
- Dark theme by default (#1B2D3D background)
- Responsive: mobile-first + media queries (no complex breakpoints)

---

## Backend Architecture

### Request/Response Flow
1. Route handler (Express) → validates request
2. Controller → calls model functions + business logic
3. Model → executes database queries (pg library)
4. Response → JSON (200, 400, 401, 404, 500)

### Authentication
- JWT in Authorization header: `Bearer <token>`
- Token expires in 7 days (refresh not needed for MVP)
- Refresh: re-login required
- Logout: client clears localStorage (stateless)

### Error Handling
- Global error handler middleware (catches all errors)
- Structured error responses: `{ error, message, status }`
- Log errors to console (no external logging for MVP)
- Graceful 500 for unhandled errors

### Validation
- Input validation with Zod (lightweight, type-safe)
- Validate before querying database
- Return 400 with field errors on invalid input

---

## Development Workflow

### Local Setup
1. Clone repo
2. Install Node 18+
3. Create `.env.local` (frontend) and `.env` (backend) from `.example` files
4. Run `npm install` in both directories
5. `npm run dev` in both directories simultaneously (2 terminals)
6. Frontend runs on `http://localhost:5173`
7. Backend runs on `http://localhost:3000`

### Coding Standards
- **Variables:** camelCase
- **Functions:** camelCase
- **Components:** PascalCase
- **Constants:** UPPER_SNAKE_CASE
- **Files:** PascalCase (components), lowercase (utils, hooks)
- **Comments:** Explain *why*, not *what* (code is self-documenting)

### Git Workflow (Simple)
- Main branch is production-ready
- Feature branches optional (small team)
- Commit messages: `type: brief description`
  - `feat: add chord-over-lyric display`
  - `fix: validate capo input`
  - `refactor: extract ChordPro parser`
  - `docs: update API endpoint list`

### Testing (Defer to Phase 2)
- MVP: manual testing only
- Phase 2: add Jest + React Testing Library
- No UI test coverage until stable

---

## Known Constraints & Decisions

### Why Zero-Cost Tech Stack?
- MVP validation before paid infrastructure
- Josh has day job; minimal operational overhead
- Can upgrade to paid tiers later (Supabase, Railway)

### Why ChordPro Format?
- Musician standard; widely supported
- Human-readable; easy to edit in text editor
- Can export from Ultimate Guitar app
- Parser can be improved incrementally

### Why Monospace for Chords?
- Precise alignment (each character = fixed width)
- Visual distinction from lyrics
- Standard for chord charts

### Why JWT (Not Sessions)?
- Stateless (easier to deploy)
- No server-side session storage needed
- Can scale backend later without session sync

### Why Invite Codes?
- Simple access control (no public signup)
- Admin assigns roles (prevents wrong permissions)
- Can revoke by deleting code from database

### Why Cloudinary (Not AWS)?
- Free tier covers band needs (25GB/month)
- Built-in image transformations (resize, compress)
- Simple API; no credential management complexity

### Why Supabase (Not Heroku/AWS)?
- Managed PostgreSQL (no ops work)
- Free tier covers MVP
- Integrates with Railway backend (same region possible)
- Can export data if needed (Postgres standard)

---

## Common Development Tasks

### Adding a New Song Field
1. Add column to `songs` table in `database/schema.sql`
2. Add field to POST/PATCH request validation (Zod schema)
3. Update `Song.js` model to include field in queries
4. Update controller to handle new field
5. Update frontend form component
6. Test locally

### Uploading a Tab with Recording
1. User fills form: ChordPro file + MP3
2. Frontend calls POST /api/songs/:id/tabs with FormData
3. Backend parses ChordPro → display format (JSONB)
4. Backend uploads MP3 to Cloudinary
5. Backend stores tab + recording metadata
6. Frontend displays parsed chords + player

### Creating a Gig & Setlist
1. Gig Lead creates gig: date, venue
2. Adds Final songs via drag-drop
3. Reorders songs (setlist_items.position)
4. Saves setlist
5. Band members view upcoming gigs + setlist

### Resolving a Comment Thread
1. Member comments on tab
2. Another member replies
3. Song writer marks resolved
4. Thread grayed out (but visible, not deleted)

---

## Deployment Checklist (Phase 2)

### Before First Deployment
- [ ] Environment variables configured (Supabase, Cloudinary, JWT secret)
- [ ] Database schema created in Supabase
- [ ] Backend API tested locally
- [ ] Frontend tested locally
- [ ] Error handling for all edge cases
- [ ] Security: CORS configured, input validated, passwords hashed
- [ ] README updated with setup instructions

### Vercel (Frontend)
- [ ] Connect GitHub repo
- [ ] Set environment variables
- [ ] Auto-deploy on push to main

### Railway (Backend)
- [ ] Create project
- [ ] Deploy from GitHub
- [ ] Set environment variables
- [ ] Configure Procfile or package.json start script

### Supabase (Database)
- [ ] Create project
- [ ] Run schema.sql to create tables
- [ ] Note database URL and API key
- [ ] Configure CORS for Vercel domain

---

## Phase 2 Features (Post-MVP)

- Real-time collaboration on songs (WebSockets)
- Member profiles + bio photos
- Gig attendance tracking + payment splits
- Full offline mode (Service Worker)
- Mobile apps (React Native via Expo)
- Change history + attribution for tabs
- Email notifications
- Analytics (most-played songs, gig stats)

---

## Questions for Josh (If Unclear)

1. Should comments on tabs notify the tab uploader?
2. Can multiple Gig Leads manage the same gig?
3. Should setlist show lead singer for each song?
4. Is there a max file size for ChordPro uploads?
5. Can members see who edited which version of a tab?
6. Should messages be band-wide only, or allow DMs?

---

## Quick Reference Links

- **Project Files:** `/mnt/project/` (RTM, design mockups, images)
- **Requirements Spec:** Moonshine_Saints_Requirements.md
- **Design System:** Moonshine_Saints_Design_System.md
- **ChordPro Spec:** ChordPro_Parser_Spec.md
- **Tech Stack:** Moonshine_Saints_Tech_Stack.md
- **Repo Structure:** Moonshine_Saints_Repo_Structure.md
- **Setup Guide:** SETUP.md (in repo)

---

## Version History

- **v0.1.0** (Sep 2026) — Initial claude.md; MVP requirements, design, tech stack defined
