# Moonshine Saints — Complete Setup Guide (Simplified Stack)

**Goal:** Deploy a zero-cost full-stack web app using only 3 services forever.

**Tech Stack:**
- **Frontend:** React + Vite → Vercel
- **Backend:** Node.js + Express → Render
- **Database + Storage:** PostgreSQL + Supabase Storage → Supabase
- **Recordings:** YouTube links (stored in database)

**Time Required:** ~1-2 hours for first-time setup

**Total Cost:** $0/month forever (no surprises after free trial)

**Prerequisites:**
- Node.js 18+ installed (`node --version`)
- Git installed and GitHub account created
- Code editor (VS Code recommended)

---

## Phase 1: Create GitHub Repository

### Step 1.1: Create Repo Structure Locally

```bash
# Create project directory
mkdir moonshine-saints
cd moonshine-saints

# Initialize Git
git init
git config user.name "Your Name"
git config user.email "your.email@github.com"

# Create directory structure
mkdir -p frontend/src/{components,pages,hooks,utils,context,styles}
mkdir -p frontend/public
mkdir -p backend/src/{routes,controllers,middleware,models,utils,config}
mkdir -p backend/migrations backend/seeds
mkdir -p database docs .github/workflows

# Create root files
touch .gitignore README.md SETUP.md LICENSE claude.md
```

### Step 1.2: Create .gitignore

**File:** `moonshine-saints/.gitignore`

```
# Dependencies
node_modules/
.npm
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.*.local
.DS_Store

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# OS
Thumbs.db
.DS_Store
```

### Step 1.3: Create README.md

**File:** `moonshine-saints/README.md`

```markdown
# Moonshine Saints

A web app for the Moonshine Saints band to manage songs, tabs, gigs, and communication.

## Tech Stack

- **Frontend:** React + Vite (hosted on Vercel)
- **Backend:** Node.js + Express (hosted on Render)
- **Database:** PostgreSQL (hosted on Supabase)
- **File Storage:** Supabase Storage (1GB free)
- **Recording Links:** YouTube (band uploads)

## Zero-Cost Forever

- Vercel free tier for frontend
- Render free tier for backend (cold starts are fine)
- Supabase free tier for database + storage
- YouTube free for recording links
- **Total: $0/month**

## Quick Start

### Prerequisites
- Node.js 18+
- Git
- GitHub, Supabase, Render, Vercel accounts (all free)

### Local Development

```bash
git clone https://github.com/YOUR_USERNAME/moonshine-saints.git
cd moonshine-saints
# Follow SETUP.md for detailed instructions
```

### Running Locally

**Terminal 1: Frontend**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2: Backend**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3000
```

## Deployment

See `SETUP.md` Phase 5 (Deployment).

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Push and create pull request

## License

MIT
```

### Step 1.4: Initial Git Commit

```bash
cd moonshine-saints

# Add all files
git add .

# Commit
git commit -m "initial: boilerplate repo structure for Moonshine Saints MVP"

# Rename branch to main (if not already)
git branch -M main
```

### Step 1.5: Create GitHub Repository

1. Go to **GitHub.com** → click **New Repository** (top-right)
2. **Repository name:** `moonshine-saints`
3. **Description:** "Web app for Moonshine Saints band — songs, tabs, gigs, messaging"
4. **Public** or **Private** (your choice)
5. **Do NOT** initialize with README, .gitignore, or license (we already have them)
6. Click **Create Repository**

### Step 1.6: Push to GitHub

```bash
# Add remote (copy from GitHub repo page)
git remote add origin https://github.com/YOUR_USERNAME/moonshine-saints.git

# Push to main
git branch -M main
git push -u origin main
```

**Verify:** Refresh GitHub repo page — you should see your files.

---

## Phase 2: Set Up Backend (Node.js + Express)

### Step 2.1: Create Backend package.json

**File:** `backend/package.json`

```json
{
  "name": "moonshine-saints-backend",
  "version": "0.1.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node seeds/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5",
    "@supabase/supabase-js": "^2.38.0",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Step 2.2: Create Backend Environment Template

**File:** `backend/.env.example`

```
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/moonshine_saints

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRATION=7d

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_public_key
SUPABASE_STORAGE_BUCKET=recordings

# CORS
FRONTEND_URL=http://localhost:5173
```

### Step 2.3: Create Minimal Backend Server

**File:** `backend/src/server.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
```

### Step 2.4: Create Database Connection Module

**File:** `backend/src/config/database.js`

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    console.log(`Query executed in ${Date.now() - start}ms`);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

export async function getClient() {
  return await pool.connect();
}

export async function closePool() {
  await pool.end();
}

export { pool as default };
```

### Step 2.5: Create Supabase Storage Module

**File:** `backend/src/config/storage.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function uploadRecording(file, fileName) {
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .upload(`recordings/${fileName}`, file);
  
  if (error) throw error;
  return data;
}

export async function deleteRecording(filePath) {
  const { error } = await supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .remove([filePath]);
  
  if (error) throw error;
}

export async function getPublicUrl(filePath) {
  const { data } = supabase.storage
    .from(process.env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

export default supabase;
```

### Step 2.6: Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected output:** Dependencies installed in `node_modules/`

---

## Phase 3: Set Up Frontend (React + Vite)

### Step 3.1: Create Frontend package.json

**File:** `frontend/package.json`

```json
{
  "name": "moonshine-saints-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .jsx,.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.53.0"
  }
}
```

### Step 3.2: Create Vite Config

**File:** `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### Step 3.3: Create Frontend HTML Entry

**File:** `frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Moonshine Saints</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 3.4: Create Frontend Environment Template

**File:** `frontend/.env.example`

```
VITE_API_URL=http://localhost:3000
```

### Step 3.5: Create Frontend Vite Entry

**File:** `frontend/src/main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 3.6: Create App Component

**File:** `frontend/src/App.jsx`

```javascript
export default function App() {
  return (
    <div className="container">
      <h1>Moonshine Saints</h1>
      <p>Band app coming soon...</p>
    </div>
  )
}
```

### Step 3.7: Create Global Styles

**File:** `frontend/src/styles/index.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-page: #0F1419;
  --bg-card: #1B2D3D;
  --copper: #A0714F;
  --cream: #D4C5A0;
  --silver: #C0C0C0;
  --border: #4A5D73;
  --text-primary: #E8E8E8;
  --text-secondary: #999;
  --text-muted: #666;
}

body {
  background-color: var(--bg-page);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1, h2, h3 {
  font-family: Georgia, serif;
  color: var(--cream);
  margin-bottom: 1rem;
}

button {
  background-color: var(--copper);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  opacity: 0.9;
}
```

### Step 3.8: Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Expected output:** Dependencies installed in `node_modules/`

---

## Phase 4: Set Up Supabase (PostgreSQL + Storage)

### Step 4.1: Create Supabase Account

1. Go to **supabase.com**
2. Click **Start your project** (or **Sign Up**)
3. Sign in with GitHub (easiest)
4. Create organization (default name is fine)
5. Create project:
   - **Name:** `moonshine-saints`
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Closest to you (e.g., US East for USA)
6. Wait for project to initialize (2-3 minutes)

### Step 4.2: Get Database Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Under **Connection String**, select **Node.js**
3. Copy the connection string (it shows as a template with placeholders)
4. Replace `[YOUR-PASSWORD]` with your database password
5. URL format: `postgresql://postgres:PASSWORD@host:5432/postgres`

### Step 4.3: Create Supabase Storage Bucket

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. **Name:** `recordings`
4. **Public** toggle: ON (so band members can access URLs)
5. Click **Create bucket**

### Step 4.4: Create Database Schema

1. Go to **SQL Editor** in Supabase dashboard (left sidebar)
2. Click **New Query**
3. Paste the following SQL:

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('songwriter', 'gig_lead', 'member')),
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Songs
CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lead_singer_id INT REFERENCES users(id),
  songwriters INT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'WIP' CHECK (status IN ('WIP', 'Final')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabs
CREATE TABLE tabs (
  id SERIAL PRIMARY KEY,
  song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1,
  is_minor_edit BOOLEAN DEFAULT FALSE,
  capo INT,
  tuning TEXT,
  key TEXT,
  tempo INT,
  chorpro_source TEXT,
  display_format JSONB,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recordings (supports YouTube URL or Supabase Storage path)
CREATE TABLE recordings (
  id SERIAL PRIMARY KEY,
  tab_id INT NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('mp3', 'youtube')),
  duration_seconds INT,
  uploaded_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gigs
CREATE TABLE gigs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  venue TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Setlist Items
CREATE TABLE setlist_items (
  id SERIAL PRIMARY KEY,
  gig_id INT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(gig_id, song_id)
);

-- Messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  thread_id INT REFERENCES messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_id INT REFERENCES users(id),
  parent_message_id INT REFERENCES messages(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  tab_id INT NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  commenter_id INT REFERENCES users(id),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes (for faster queries)
CREATE INDEX idx_songs_lead_singer ON songs(lead_singer_id);
CREATE INDEX idx_tabs_song ON tabs(song_id);
CREATE INDEX idx_tabs_created_by ON tabs(created_by);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_comments_tab ON comments(tab_id);
CREATE INDEX idx_gigs_date ON gigs(date);
```

4. Click **Run** (blue button)
5. Check for green checkmark ✓ (no errors)

### Step 4.5: Configure Backend Environment

**File:** `backend/.env` (create from `.env.example`)

```
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres

JWT_SECRET=your_super_secret_key_xyz123
JWT_EXPIRATION=7d

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_public_key
SUPABASE_STORAGE_BUCKET=recordings

FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `YOUR_PASSWORD` with your Supabase database password
- `aws-0-us-east-1.pooler.supabase.com` with your Supabase host (from connection string)
- `https://your-project.supabase.co` with your Supabase project URL
- `your_supabase_public_key` with your Supabase public API key (found in Settings → API)

---

## Phase 5: Test Local Development

### Step 5.1: Start Backend

**Terminal 1:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
Backend running on http://localhost:3000
Environment: development
```

### Step 5.2: Start Frontend

**Terminal 2:**
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 5.3: Test Connection

1. Open browser → **http://localhost:5173**
2. You should see "Moonshine Saints" heading
3. Open browser dev tools → **Console**
4. Should be no errors
5. Backend should show request log in terminal

### Step 5.4: Test API Connection

**In browser console, run:**
```javascript
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected output:**
```javascript
{ status: 'OK', timestamp: '2024-...', environment: 'development' }
```

### Step 5.5: Test Database Connection

**In backend terminal, create test file `backend/test-db.js`:**

```javascript
import { query } from './src/config/database.js';

try {
  const result = await query('SELECT NOW()');
  console.log('Database connected:', result.rows[0]);
  process.exit(0);
} catch (err) {
  console.error('Database error:', err.message);
  process.exit(1);
}
```

**Run:**
```bash
cd backend
node test-db.js
```

**Expected output:**
```
Database connected: { now: 2024-... }
```

---

## Phase 6: Deploy to Production

### Step 6.1: Deploy Frontend to Vercel

1. Go to **vercel.com**
2. Click **Sign Up** → connect with GitHub
3. Click **New Project**
4. Select `moonshine-saints` repo
5. **Framework:** Next.js (Vite is custom, so keep it as-is)
6. **Root Directory:** `./frontend`
7. **Build Command:** `npm run build`
8. **Output Directory:** `dist`
9. **Environment Variables:**
   - Key: `VITE_API_URL`
   - Value: `https://your-render-api.onrender.com` (set after Render is deployed)
10. Click **Deploy**

**Expected:** Vercel builds and deploys. You get a live URL (e.g., `https://moonshine-saints.vercel.app`).

### Step 6.2: Deploy Backend to Render

1. Go to **render.com**
2. Click **Sign Up** → connect with GitHub
3. Click **New +** → **Web Service**
4. Select `moonshine-saints` repo
5. **Name:** `moonshine-saints-api`
6. **Environment:** Node
7. **Region:** Closest to you
8. **Branch:** main
9. **Build Command:** `cd backend && npm install`
10. **Start Command:** `node backend/src/server.js`
11. **Runtime:** Node
12. Add environment variables:
    - `DATABASE_URL` (from Supabase)
    - `JWT_SECRET` (generate new random 32-char string)
    - `SUPABASE_URL` (from Supabase Settings)
    - `SUPABASE_KEY` (from Supabase API keys)
    - `SUPABASE_STORAGE_BUCKET=recordings`
    - `FRONTEND_URL=https://your-vercel-url.vercel.app`
    - `NODE_ENV=production`
13. Click **Create Web Service**

**Expected:** Render builds and deploys. You get a public URL (e.g., `https://moonshine-saints-api.onrender.com`).

**Note:** First deploy takes 3-5 minutes. Render free tier has cold starts (30 sec), which is fine for a band app.

### Step 6.3: Update Frontend with Backend URL

1. Go back to **Vercel**
2. Go to **Settings** → **Environment Variables**
3. Update `VITE_API_URL=https://your-render-api.onrender.com`
4. **Redeploy** (Vercel → click **Redeploy**)

### Step 6.4: Test Production

1. Open Vercel live URL in browser
2. Confirm page loads with no errors
3. Open browser console
4. Run: 
```javascript
fetch('https://your-render-url/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```
5. Should see `{ status: 'OK', ... }`

---

## Troubleshooting

### Backend Won't Start

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:** Database connection string is wrong.
- Check `DATABASE_URL` in `.env`
- Verify Supabase password is correct
- Verify host is correct (not `localhost`, should be Supabase host)

---

### Frontend Can't Call Backend

**Problem:** CORS error in browser console

**Solution:** Check backend CORS config.
- `FRONTEND_URL` in `.env` matches frontend URL exactly
- Backend running with correct CORS middleware

---

### Supabase Upload Fails

**Problem:** `Error: 401 Unauthorized`

**Solution:** Check credentials.
- `SUPABASE_URL` is correct
- `SUPABASE_KEY` is correct (should be public key, not secret key)
- Storage bucket `recordings` exists and is public

---

### Render Cold Start (First Request Slow)

**Problem:** First request after inactivity takes 30+ seconds

**Solution:** This is normal for Render free tier.
- No fix needed; expected behavior
- Subsequent requests are fast
- Not a problem for band app (predictable usage)

---

### Vercel Build Fails

**Problem:** `Build failed`

**Solution:** Check build logs.
- Ensure `frontend/` has `package.json` and `vite.config.js`
- Ensure `npm run build` runs without errors locally
- Check for missing environment variables
- Check for unresolved imports

---

## Next Steps After Setup

1. ✅ GitHub repo created
2. ✅ Backend scaffolding in place
3. ✅ Frontend scaffolding in place
4. ✅ Supabase database + storage ready
5. ✅ Local development working
6. ✅ Production deployment ready

**Now:**
- Use **Claude Code** in VS Code to build components
- Implement API routes one by one
- Test locally before pushing to main
- Deploy after each feature is complete

---

## Quick Reference: Commands

```bash
# Local development
cd backend && npm run dev           # Start backend
cd frontend && npm run dev          # Start frontend

# Build for production
cd frontend && npm run build        # Builds to dist/
cd backend && npm run start         # Runs production server

# Database
node test-db.js                     # Test connection

# Git
git add .                           # Stage changes
git commit -m "message"             # Commit
git push                            # Push to GitHub

# Install dependencies
npm install                         # After cloning or adding packages
```

---

## Summary: Your Tech Stack (Final)

```
🎸 Moonshine Saints Application

Frontend:    React 18 + Vite → Vercel
Backend:     Node.js + Express → Render
Database:    PostgreSQL → Supabase
Storage:     Supabase Storage (1GB free)
Recordings:  YouTube URLs (stored in DB)

Total Cost:  $0/month FOREVER
Services:    3 (Vercel, Render, Supabase)
Complexity:  Minimal, focused on features
```

You've got this! 🚀
