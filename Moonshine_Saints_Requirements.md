# Moonshine Saints Application Requirements
## MVP Specification

**Version:** 1.0  
**Date:** September 19, 2026  
**Stakeholders:** 6 band members  
**Primary Goals:** Centralize song storage, tab management, recording sharing, and band communication

---

## 1. Overview

The Moonshine Saints application is a web-based platform for managing band content (songs, tabs, recordings) and enabling band-wide communication. It replaces fragmented group text chat and scattered file storage with a single, organized hub.

### Key Constraints for MVP
- Fixed 6-member group (no dynamic member management)
- Web app only (mobile app in future release)
- Download/caching for offline reference (not full offline mode)
- Simple invite-code authentication

---

## 2. Core Features

### 2.1 Content Management: Songs, Tabs & Recordings

#### Song Structure
- **Title** (required)
- **Lead Singer(s)** (one singer, or mark as "duet" for two)
- **Status** (WIP or Final)
- **Associated Recording** (one per song; MP3, YouTube link, or voice memo)
- **Associated Tabs** (one or more, with versioning)
- **Chords Over Lyrics** display (Ultimate Guitar-like format)

#### Tab Structure
- **Format:** ChordPro (plain text with chord markup)
  - Example: `[Am]I've been [G]drinking all [D]night`
- **Metadata:**
  - Capo
  - Tuning
  - Key
  - Tempo
  - Chords over lyrics
  - Lead singer
  - Song writer(s)
- **Source Options:**
  - Band-created (ChordPro text upload)
  - Cover with Ultimate Guitar link
  - Cover with downloaded Ultimate Guitar tab file (re-uploaded for offline access)

#### Recording Storage
- **Accepted Formats:** MP3, YouTube links, voice memos
- **Relationship:** One recording per tab
- **Use:** Reference for chord/arrangement interpretation
- **Player:** In-app player or link to external recording

#### Tab Versioning
- **Major Versions:** New arrangement uploaded
  - Requires explicit version update
  - Tracked in version history
- **Minor Versions:** Inline edits to chords, key, tempo, capo
  - No new version created
  - Updates happen in place
- **Version History Display:** Shows only major versions

### 2.2 Role-Based Permissions

| Role | Permissions |
|------|-------------|
| **Song Writer** | Own lyrics; approve/deny changes to lyrics; anyone else can comment but not edit |
| **All Members** | Edit chords, key, tempo, capo; create threaded comments on song sections; upload new tab versions |
| **Gig Lead** | Create and manage gigs; build and reorder setlists (multiple gig leads allowed) |

### 2.3 Gigs & Setlists

#### Gig Definition
- **Date** (required)
- **Venue** (required)
- **Setlist** (ordered list of songs)

#### Setlist Management
- **Creation:** Gig Lead browses, searches, and drag-and-drops songs to build setlist
- **Reordering:** Drag-and-drop within setlist
- **Song Filter:** Only "Final" songs appear (WIP songs excluded)
- **Future:** Attendance tracking, load-out checklists, sound check notes, payment splits (backlog)

### 2.4 Communication

#### Messaging
- **Scope:** Band-related communication only
- **Format:** Threaded conversations on specific song sections or general messages
- **Features:**
  - Threaded discussions (resolvable/dismissable)
  - Searchable message history
  - Home feed with recent messages, uploads, and gig updates

#### Home Feed
- **Content:** Mix of recent messages, file uploads, gig updates, status changes
- **Ordering:** Chronological or grouped by song/gig (user preference)
- **Scope:** All activity (upcoming gigs + historical content)

---

## 3. Data & Security

### 3.1 Encryption
- **At-Rest Encryption:** All data encrypted to protect copyright of original compositions
- **Rationale:** Protects band's original music from unauthorized access

### 3.2 Content Ownership
- **Ownership Model:** Songwriting credits determine ownership
- **Multi-Creator Songs:** Multiple songwriters share equal rights
- **Band Departure:** Not handled in MVP; address in future release

### 3.3 Data Backup & Retention
- TBD (to be determined with hosting provider)

---

## 4. Authentication & Access

### 4.1 User Authentication
- **Method:** Simple invite codes
- **Process:** Administrator generates invite code; new member uses code to join
- **Member Limit:** Fixed 6 members (no dynamic add/remove in MVP)

### 4.2 Access Control
- **Default:** All members can view all content (subject to role permissions above)
- **Leaving Band:** Deferred to future release

---

## 5. Platform & Hosting

### 5.1 Platform
- **MVP:** Web app (responsive for desktop/tablet)
- **Future:** Mobile app (iOS/Android)

### 5.2 Offline Capability
- **MVP:** Download/caching of tabs, recordings, and lyrics for offline reference
- **Future:** Full offline mode with sync on reconnect

### 5.3 Hosting
- **Provider:** Lowest-cost viable option
- **Owner:** One person manages and pays for hosting
- **Uptime Expectation:** TBD (to be defined)

---

## 6. User Interface Requirements

### 6.1 Main Navigation
- **Home:** Feed of recent activity
- **Songs:** Browse all songs, filter by lead singer, WIP/Final status
- **Gigs:** List upcoming gigs, manage setlists
- **Messages:** Global chat and threaded conversations
- **Settings:** User preferences, invite management (for admin)

### 6.2 Song View
- **Display:** Chords over lyrics (ChordPro rendered)
- **Recording:** Embedded player or link
- **Metadata:** Lead singer, song writer, key, tempo, capo, tuning
- **Tabs:** List of tab versions with major version history
- **Comments:** Threaded discussions on song sections (resolvable/dismissable)

### 6.3 Gig View
- **Details:** Date, venue, setlist (ordered)
- **Actions:** Edit (Gig Lead only), reorder songs via drag-and-drop
- **Song Filter:** Only Final songs shown

### 6.4 Upload Workflow
- **Songs:** Upload lyrics + metadata (lead singer, status, song writer)
- **Tabs:** Upload ChordPro file or paste text, specify format (original/cover/Ultimate Guitar link)
- **Recordings:** Upload MP3, paste YouTube link, or record voice memo
- **Metadata Entry:** Capo, tuning, key, tempo, lead singer

---

## 7. Search & Discovery

- **Songs:** Search by song name, filter by lead singer, WIP/Final status
- **Gigs:** Browse by date or venue
- **Messages:** Full-text search across all threaded conversations
- **Recordings:** Search by song name, date uploaded

---

## 8. Future Features (Backlog)

### 8.1 Song Writing Collaboration
- Write new songs together in the app
- Support lyrics-first or music-first workflows
- Threaded comments on song sections with @mentions
- Attribution & change history
- Collaborative arrangement refinement

### 8.2 Enhanced Gig Management
- Attendance tracking (who's playing)
- Load-out checklist (what gear to bring)
- Sound check notes
- Payment split tracking & settlement

### 8.3 Member Management
- Dynamic member add/remove with role assignment
- Handle departing members (archive their contributions, transfer ownership)
- Member profiles (instrument, contact info)

### 8.4 Mobile & Offline
- Native iOS/Android apps
- Full offline mode with automatic sync
- Background downloads for recordings/tabs

### 8.5 Playback & Collaboration
- In-app metronome
- Backing track playback
- Real-time jam session features (future exploration)

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Response Time** | <2s for page load, <500ms for interactions |
| **Uptime** | TBD |
| **Browser Support** | Chrome, Firefox, Safari (latest 2 versions) |
| **Mobile Responsiveness** | iPad and tablet-sized screens |
| **Data Encryption** | AES-256 at rest |
| **Backup Frequency** | TBD (to be determined) |
| **Max Upload Size** | TBD (to be determined; depends on hosting) |

---

## 10. Success Criteria for MVP

- ✅ All 6 band members can log in with invite code
- ✅ Upload and organize 100% of band's existing songs with tabs and recordings
- ✅ Gig Lead can create a setlist and share with band
- ✅ Band can communicate via threaded messages (replacing group text)
- ✅ Search works across songs, gigs, and messages
- ✅ ChordPro tabs render correctly with chords over lyrics
- ✅ Recording player works for MP3, YouTube links
- ✅ Permissions enforced (Song Writer controls lyrics, Gig Lead manages gigs)
- ✅ Band reports no friction compared to current workflow

---

## 11. Out of Scope (MVP)

- Dynamic member management
- Offline-first/full offline mode
- Mobile apps
- Payment/financial tracking
- Integration with streaming services (Spotify, YouTube Music)
- Social features (public profiles, discovery)
- Merchandise or ticketing
- Video/live jam sessions

---

## 12. Assumptions & Open Questions

| Item | Status | Notes |
|------|--------|-------|
| Exact member names and roles | TBD | Define actual Gig Leads |
| Hosting provider & cost | TBD | Research lowest-cost options (Firebase, Vercel, DigitalOcean, etc.) |
| Max file upload size | TBD | Dependent on hosting choice |
| Backup & recovery SLA | TBD | Define acceptable data loss window |
| Browser support | Assumed | Latest 2 versions of major browsers sufficient? |
| Data retention after member departure | Backlog | Plan for MVP+1 |

---

## 13. Next Steps

1. **Design Phase:** Wireframes and UI mockups for sign-up, home feed, song view, gig management
2. **Tech Stack Decision:** Choose hosting, backend (Node/Python/Supabase?), frontend framework
3. **Database Schema:** Map out tables for songs, tabs, recordings, gigs, users, permissions
4. **API Design:** Define endpoints for CRUD operations on all entities
5. **Testing Plan:** Unit, integration, and user acceptance testing
6. **Deployment:** Set up CI/CD pipeline, staging environment, monitoring
7. **Launch:** Beta test with band, gather feedback, iterate
