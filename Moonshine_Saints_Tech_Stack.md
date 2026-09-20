# Moonshine Saints MVP — Tech Stack Architecture

**Version:** 1.0  
**Date:** September 19, 2026  
**Target Cost:** $0/month (MVP, 6 users, 1 year)  
**Upgrade Path:** React Native for mobile (code reuse: 70–80%)

---

## Technology Stack

### Frontend
- **Framework:** React 18+ with TypeScript (optional but recommended)
- **Build Tool:** Vite (ESM-native, fast HMR, small bundle)
- **Styling:** CSS Modules or Tailwind CSS (free)
- **HTTP Client:** Axios or Fetch API
- **State Management:** Context API + useReducer (built-in, no Redux needed)
- **Form Handling:** React Hook Form (lightweight, performant)
- **UI Components:** Shadcn/ui (headless, free, tailored to our dark theme)

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js (lightweight, minimal overhead)
- **Language:** JavaScript or TypeScript
- **Authentication:** JWT (JSON Web Tokens) + simple invite code validation
- **File Uploads:** Multer (middleware for handling file uploads)
- **ChordPro Parser:** Write custom parser (300–400 lines) OR use existing npm package
- **Database Client:** `pg` (PostgreSQL) or Prisma ORM (for type safety)
- **Validation:** Zod or Joi (input validation)
- **CORS:** Express CORS middleware
- **Error Handling:** Custom error handler middleware
- **Logging:** Console + Winston (free logging library)

### Database
- **Platform:** Supabase (PostgreSQL managed)
- **Free Tier Limits:** 
  - 500MB storage (plenty for 100 songs + metadata + messages)
  - 50k API requests per month (overkill for 6 users)
  - Unlimited bandwidth
  - Real-time subscriptions (unused MVP, future enhancement)
- **Tables:**
  - Users
  - Songs (with metadata)
  - Tabs (ChordPro source + display format)
  - Recordings (file paths, not actual files)
  - Gigs
  - SetlistItems (junction table)
  - Messages
  - Comments
  - TabVersions

### File Storage
- **For Recordings & Tabs:** Cloudinary (free tier)
  - 25 GB/month bandwidth included
  - Unlimited transformations
  - Auto-optimization for web
  - CDN included
  - Supports MP3, video (YouTube embeds), files, voice memos
  
- **Alternative if you hit Cloudinary limits:** AWS S3 (free for 1 year)
  - 5 GB storage included
  - 20k GET, 2k PUT requests free monthly
  - After 1 year: ~$0.50–2/month for your expected usage

### Hosting

#### Frontend (Vercel)
- **Cost:** $0/month
- **Specs:**
  - Auto-deploys from GitHub
  - Unlimited bandwidth
  - Global CDN
  - 100 deployments/day
  - Serverless Functions (not needed for this MVP)
- **Setup:** Connect GitHub repo, done

#### Backend (Railway)
- **Cost:** $0/month (free monthly credit covers Node app)
- **Specs:**
  - 1 GB RAM, 1 CPU for free tier
  - Sufficient for 6 concurrent users
  - Environment variables (secure secrets)
  - Logging & monitoring included
  - Auto-deploys from GitHub
  - Can scale to paid ($5–50/month) as needed
- **Alternative if Railway exhausted:** Render.com (similar, also free tier)

#### Database (Supabase)
- **Cost:** $0/month (free tier)
- **Specs:**
  - 500MB PostgreSQL database
  - Real-time API
  - Auto-generated REST API
  - JWT auth built-in
  - Full SQL access
- **Upgrade Path:** Simple slider to paid tiers ($25+/month) when needed

---

## Data Model & Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  invite_code VARCHAR(50) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'band_member', -- band_member, gig_lead
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Songs Table
```sql
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  lead_singer UUID REFERENCES users(id),
  song_writer UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'final', -- final, wip
  key VARCHAR(50), -- E Major, D minor, etc.
  tempo INTEGER, -- BPM
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabs Table
```sql
CREATE TABLE tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  version_number INTEGER DEFAULT 1, -- Major version
  is_minor_edit BOOLEAN DEFAULT FALSE, -- Minor version flag
  chorpro_source TEXT NOT NULL, -- Raw ChordPro format
  display_format JSONB, -- Parsed chord-over-lyric format (cached)
  capo VARCHAR(50),
  tuning VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tabs_song_id ON tabs(song_id);
```

### Recordings Table
```sql
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  file_url VARCHAR(500), -- Cloudinary URL
  file_type VARCHAR(50), -- mp3, youtube_link, voice_memo
  duration_seconds INTEGER,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recordings_tab_id ON recordings(tab_id);
```

### Gigs Table
```sql
CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gigs_date ON gigs(date);
```

### SetlistItems Table
```sql
CREATE TABLE setlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Order in setlist (1, 2, 3...)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_setlist_gig_id ON setlist_items(gig_id);
CREATE INDEX idx_setlist_song_id ON setlist_items(song_id);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID DEFAULT uuid_generate_v4(), -- Group messages into threads
  content TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id),
  parent_message_id UUID REFERENCES messages(id), -- For threaded replies
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tab_id UUID NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  commenter_id UUID NOT NULL REFERENCES users(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_tab_id ON comments(tab_id);
```

---

## API Endpoint Structure

### Authentication
```
POST /api/auth/signup        - Create account (invite code required)
POST /api/auth/login         - Log in (email + password)
POST /api/auth/logout        - Log out
POST /api/auth/verify-token  - Validate JWT
```

### Songs
```
GET  /api/songs              - List all songs (with filters)
GET  /api/songs/:id          - Get song details
POST /api/songs              - Create song
PATCH /api/songs/:id         - Update song metadata (key, tempo, capo, tuning)
DELETE /api/songs/:id        - Delete song (admin/creator only)
```

### Tabs
```
GET  /api/songs/:id/tabs     - List tabs for a song
POST /api/songs/:id/tabs     - Upload new tab (ChordPro file)
PATCH /api/tabs/:id          - Edit tab (chords, key, tempo, capo)
GET  /api/tabs/:id/versions  - Get version history
```

### Recordings
```
POST /api/tabs/:id/recording - Upload recording (file or YouTube link)
GET  /api/tabs/:id/recording - Get recording metadata
DELETE /api/recordings/:id   - Delete recording
```

### Gigs
```
GET  /api/gigs               - List all gigs (sorted by date)
GET  /api/gigs/:id           - Get gig details
POST /api/gigs               - Create gig (Gig Lead only)
PATCH /api/gigs/:id          - Update gig (Gig Lead only)
DELETE /api/gigs/:id         - Delete gig (Gig Lead only)
```

### Setlists
```
GET  /api/gigs/:id/setlist   - Get setlist for a gig
POST /api/gigs/:id/setlist   - Add song to setlist (Gig Lead only)
PATCH /api/setlist/:id       - Reorder setlist (Gig Lead only)
DELETE /api/setlist/:id      - Remove song from setlist (Gig Lead only)
```

### Messages
```
GET  /api/messages           - Get all messages (paginated)
POST /api/messages           - Send message
GET  /api/messages/:threadId - Get thread (messages + replies)
PATCH /api/messages/:id      - Resolve/dismiss comment
```

### Comments
```
GET  /api/tabs/:id/comments  - Get comments on a tab
POST /api/tabs/:id/comments  - Add comment
PATCH /api/comments/:id      - Resolve/dismiss comment
```

---

## Development Workflow

### Local Setup

```bash
# Frontend
git clone <repo>
cd moonshine-saints-frontend
npm install
npm run dev  # Vite dev server on localhost:5173

# Backend
cd ../moonshine-saints-backend
npm install
npm run dev  # Nodemon watches for changes

# Database
# Use Supabase dashboard or SQL editor to run schema
# Or use migration tool (e.g., Prisma, Knex)
```

### Environment Variables

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@host/db
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
PORT=3000
```

### Deployment

**Frontend to Vercel:**
```bash
# Connect GitHub repo in Vercel dashboard
# Auto-deploys on push to main
# Set VITE_API_URL to production backend URL
```

**Backend to Railway:**
```bash
# Connect GitHub repo in Railway dashboard
# Set environment variables in project settings
# Auto-deploys on push to main
```

**Database Migrations:**
```bash
# Option 1: Use Supabase SQL editor (manual)
# Option 2: Use Prisma migrations (automated)
# Option 3: Use Knex.js (lightweight migration tool)
```

---

## Cost Breakdown (12-Month MVP)

| Service | Free Tier | Cost for MVP | Notes |
|---------|-----------|--------------|-------|
| Vercel (Frontend) | Unlimited | $0 | Standard tier sufficient |
| Railway (Backend) | $5/month credit | $0 | Node app uses credit |
| Supabase (Database) | 500MB, unlimited API | $0 | Plenty for 100 songs + messages |
| Cloudinary (Files) | 25 GB/month | $0 | Plenty for recordings + tabs |
| Domain (Optional) | — | $10–15/yr | Optional; use free URL first |
| **Total** | — | **$0–15/yr** | |

**After 1 Year (if still at 6 users):**
- Continue free, or upgrade Railway to $5/month if needed
- Total: $0–60/yr

**Scaling Example (50 users, 500 songs):**
- Supabase: upgrade to $25/month (1 GB, more concurrency)
- Railway: $15/month (0.5 GB RAM, better performance)
- Cloudinary: upgrade to Paid (more features, custom domain)
- Total: ~$40–60/month (sustainable for a small band)

---

## Code Structure (Monorepo Recommended)

```
moonshine-saints/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components (Home, Songs, Gigs, etc.)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helpers, API client
│   │   ├── styles/             # Global styles, theme
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # Node.js + Express
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Database queries (Prisma or SQL)
│   │   ├── middleware/         # Auth, CORS, error handling
│   │   ├── utils/              # Helpers (ChordPro parser, etc.)
│   │   ├── config/             # Environment, constants
│   │   └── server.js           # Express app entry point
│   ├── migrations/             # Database migrations (if using Prisma)
│   ├── .env.example
│   └── package.json
│
├── database/                    # SQL files (optional)
│   ├── schema.sql              # Initial schema
│   └── seed.sql                # Test data (6 users, sample songs)
│
└── README.md                    # Setup instructions
```

---

## Upgrade Path to Mobile (React Native)

### Code Reuse Strategy

**Shared:**
- API client (`utils/api.js`)
- Utility functions (ChordPro parser, format helpers)
- State management (Context + useReducer)
- Business logic

**Separate:**
- UI components (different native components vs. web HTML)
- Navigation (web uses React Router, native uses React Navigation)
- Styling (CSS Modules → StyleSheet API)

### File Structure for React Native

```
moonshine-saints-mobile/
├── src/
│   ├── shared/                 # Shared with web (API, utils, logic)
│   │   ├── api/
│   │   ├── utils/
│   │   └── hooks/
│   ├── screens/                # Native screens
│   ├── components/             # Native components
│   ├── navigation/             # React Navigation
│   └── App.js
```

**Code Reuse Estimate:**
- Shared logic: 60–70%
- Duplicated: UI components, styles, navigation: 30–40%
- Total new code: ~1,500–2,000 lines

**Timeline for Mobile:**
- 4–6 weeks with existing React knowledge
- Use Expo (easier than bare React Native) for faster iteration

---

## Security Checklist (MVP)

- [ ] JWT tokens signed with strong secret (32+ chars)
- [ ] Password hashing (bcrypt, minimum 10 rounds)
- [ ] HTTPS enforced in production
- [ ] CORS configured (only Vercel domain)
- [ ] Environment variables never in git (use .env)
- [ ] Input validation on all endpoints (Zod/Joi)
- [ ] SQL injection prevention (use parameterized queries, Prisma ORM)
- [ ] Rate limiting on auth endpoints (simple: request counter)
- [ ] Sensitive data encryption at rest (Supabase does this)
- [ ] No API keys exposed in frontend code
- [ ] File upload validation (check MIME type, size limits)

---

## Performance Targets (MVP)

| Metric | Target | Notes |
|--------|--------|-------|
| Frontend bundle size | <150KB (gzipped) | Vite does this by default |
| Time to interactive | <3s | With modern connection |
| API response time | <500ms | Express + Supabase is fast |
| Home feed load | <1s | Paginate messages |
| Song list search | <500ms | Index on song name |
| Recording playback | Streams from Cloudinary | No download lag |

---

## Monitoring & Debugging (Free Tools)

- **Frontend:** Vercel Analytics (free), browser DevTools
- **Backend:** Railway logs + console.log
- **Database:** Supabase dashboard (SQL execution, row counts)
- **Errors:** Sentry (free tier, 5k events/month) for error tracking
- **Uptime:** UptimeRobot (free tier, 50 monitors)

---

## Next Steps (Before Coding)

1. **Create GitHub repo** (monorepo with frontend + backend folders)
2. **Set up services:**
   - Vercel (connect GitHub)
   - Railway (connect GitHub)
   - Supabase (create project)
   - Cloudinary (sign up, get API key)
3. **Clone template** or start fresh:
   - Frontend: `npm create vite@latest moonshine-saints-frontend -- --template react`
   - Backend: `npm init -y && npm install express pg dotenv bcryptjs jsonwebtoken`
4. **Create database schema** (run SQL in Supabase dashboard)
5. **Build API** (start with auth, songs, gigs endpoints)
6. **Build frontend** (start with onboarding, home feed, songs list)

---

## FAQ

**Q: Will Supabase free tier handle 100 songs + 6 users + activity?**
A: Yes. 100 songs (~1 MB) + messages + metadata = well under 500MB. Free tier also includes 50k API requests/month; even with heavy usage, 6 users won't exceed this.

**Q: What if we outgrow free tier?**
A: Simple: Supabase upgrade ($25/month), Railway upgrade ($5–15/month), Cloudinary stays free or upgrades ($84+/month). Total: $30–40/month for 50+ users.

**Q: Can we switch to a different hosting provider later?**
A: Yes. Node.js is portable; PostgreSQL is standard; Cloudinary files can be exported. Migration would take 1–2 days.

**Q: Do we need Docker for this?**
A: Not for MVP. Vercel + Railway handle containerization. Consider Docker later if you self-host backend.

**Q: What about backups?**
A: Supabase auto-backups daily (free tier). Cloudinary includes redundancy. No action needed.

**Q: Should we use TypeScript?**
A: Recommended for backend (catch errors early), optional for frontend (adds ~2KB gzipped). Stick with JavaScript for MVP speed.

