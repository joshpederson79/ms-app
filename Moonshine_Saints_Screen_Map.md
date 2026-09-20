# Moonshine Saints MVP — Screen Map & User Flows

## Screen Inventory (13 screens total)

### Phase 1: Onboarding (4 screens)
1. **Welcome** — Invite code entry
2. **Sign-up** — Create account (name, email, password)
3. **Success** — Confirmation screen
4. **Home Feed** — First view of app

### Phase 2: Core Features (9 screens)
5. **Home Feed (Full)** — Activity hub with mix of updates
6. **Songs List** — Browse all band songs with filters
7. **Song Detail** — View tabs, lyrics, recordings, comments
8. **Upload Song** — Add new song to library
9. **Gigs List** — Browse upcoming/past gigs
10. **Gig Detail** — View and manage setlist
11. **Create Gig** — New gig form (date, venue, songs)
12. **Messages** — Threaded chat interface
13. **Settings** — Profile, preferences, account management

---

## User Flows

### Flow 1: New User Onboarding
```
Welcome (invite code)
    ↓
Sign-up (create account)
    ↓
Success (confirmation)
    ↓
Home Feed (enter app)
    ↓
[User can now access all features]
```

### Flow 2: Browse & Play Songs
```
Home Feed
    ↓
Click "Songs" in nav
    ↓
Songs List (search/filter)
    ↓
Click song title
    ↓
Song Detail (view tabs, play recording, read comments)
    ↓
Can: Edit chords/key/tempo, add comments, view versions
```

### Flow 3: Upload a New Song
```
Home Feed / Songs List
    ↓
Click "+ Upload" button
    ↓
Upload Song form
    ↓
Fill: name, lead singer, song writer, status, tab file, metadata
    ↓
Upload recording (optional)
    ↓
Save song
    ↓
Song appears in Songs List (Final or WIP based on status)
```

### Flow 4: Create a Gig & Set Setlist
```
Home Feed
    ↓
Click "Gigs" in nav
    ↓
Gigs List
    ↓
Click "+ New Gig" button [GIG LEAD ONLY]
    ↓
Create Gig form
    ↓
Fill: venue, date, time
    ↓
Setlist builder (drag-drop to add Final songs)
    ↓
Save gig
    ↓
Gig appears in Gigs List (Upcoming)
```

### Flow 5: Send a Message & Start Thread
```
Home Feed
    ↓
Click "Messages" in nav
    ↓
Messages (chat interface)
    ↓
Type message in input
    ↓
Click "Send"
    ↓
Message appears in thread
    ↓
Others can reply, create nested threads
```

### Flow 6: Edit Song Metadata (Permissions)
```
Song Detail
    ↓
Can edit: Chords, Key, Tempo, Capo (anyone)
    ↓
Cannot edit: Lyrics (song writer only)
    ↓
Can comment on: Lyrics (awaits song writer approval)
    ↓
Changes saved immediately (minor edits)
    ↓
New major tab version created if new file uploaded
```

---

## Screen Relationships & Navigation

```
┌─────────────────────────────────────────────────────────┐
│                    Home Feed (Hub)                      │
│                        (5)                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Recent Activity: Songs | Gigs | Messages | Cmts │   │
│  └─────────────────────────────────────────────────┘   │
└────────┬──────────────┬────────────────┬─────────┬──────┘
         │              │                │         │
         ▼              ▼                ▼         ▼
    Songs List     Gigs List        Messages   Settings
      (6)            (9)              (12)      (13)
       │              │                │
       ├─→ Song       ├─→ Gig          └─→ Threads
       │   Detail     │   Detail
       │   (7)        │   (10)
       │              │
       │              └─→ Create Gig
       │                  (11)
       │
       └─→ Upload Song
           (8)
```

---

## Feature Mapping to Screens

### Content Management

| Feature | Screens | User Type |
|---------|---------|-----------|
| Browse songs | Songs List (6), Home Feed (5) | All |
| View song details | Song Detail (7) | All |
| Upload song | Upload Song (8), Songs List (6) | All |
| Edit chords/key/tempo | Song Detail (7) | All |
| Edit lyrics | Song Detail (7) | Song Writer only |
| View tab versions | Song Detail (7) | All |
| Add comments | Song Detail (7) | All |
| Play recording | Song Detail (7) | All |

### Gig Management

| Feature | Screens | User Type |
|---------|---------|-----------|
| Browse gigs | Gigs List (9), Home Feed (5) | All |
| View gig details | Gig Detail (10) | All |
| Create gig | Create Gig (11), Gigs List (9) | Gig Lead |
| Manage setlist | Gig Detail (10), Create Gig (11) | Gig Lead |
| Reorder songs | Gig Detail (10), Create Gig (11) | Gig Lead |
| View setlist | Gig Detail (10) | All |

### Communication

| Feature | Screens | User Type |
|---------|---------|-----------|
| Send message | Messages (12) | All |
| Thread reply | Messages (12) | All |
| View message history | Messages (12), Home Feed (5) | All |
| Search messages | Messages (12) | All (future) |

### Account Management

| Feature | Screens | User Type |
|---------|---------|-----------|
| Create account | Sign-up (2) | New users |
| View profile | Settings (13) | All |
| Edit profile | Settings (13) | All |
| Change password | Settings (13) | All |
| Sign out | Settings (13) | All |
| View role | Settings (13) | All |

---

## Data Flow Diagram

```
User Action
    ↓
[Frontend Screen]
    ↓
Validation
    ↓
API Request → Backend
    ↓
Database (encrypted)
    ↓
API Response
    ↓
[Frontend updates view]
    ↓
User sees result
```

### Example: Upload Song

```
Upload Song (8)
    ↓
[User fills form: name, lead singer, song writer, tab file, metadata]
    ↓
Form validation (all required fields)
    ↓
POST /api/songs
    {
      name: "Whiskey River",
      lead_singer: "John",
      song_writer: "John",
      status: "Final",
      tab_file: [binary],
      key: "E Major",
      tempo: 120,
      capo: 2,
      tuning: "Standard",
      recording: [optional]
    }
    ↓
Backend:
  - Parse ChordPro tab
  - Store encrypted in DB
  - Return song object with ID
    ↓
Frontend:
  - Show success toast
  - Update Songs List (6) to show new song
  - Home Feed (5) shows activity
  - User can now click and view in Song Detail (7)
```

### Example: Create Gig & Setlist

```
Create Gig (11)
    ↓
[Gig Lead fills: venue, date, time]
    ↓
[Gig Lead selects Final songs from dropdown/search]
    ↓
[Gig Lead reorders via drag-drop]
    ↓
POST /api/gigs
    {
      venue: "Saturday Saloon",
      date: "2024-10-12",
      time: "21:00",
      setlist: [song_id_1, song_id_2, song_id_3, ...]
    }
    ↓
Backend:
  - Create gig record
  - Create setlist entries (ordered)
  - Return gig object
    ↓
Frontend:
  - Show success message
  - Gigs List (9) now shows new gig
  - Home Feed (5) shows "Gig posted" activity
  - All users can view in Gig Detail (10)
  - Gig Lead can edit setlist anytime
```

---

## Permission Matrix

| Action | Band Member | Gig Lead | Song Writer |
|--------|-------------|----------|-------------|
| Browse songs | ✓ | ✓ | ✓ |
| Browse gigs | ✓ | ✓ | ✓ |
| Upload song | ✓ | ✓ | ✓ |
| Edit chords/key/tempo | ✓ | ✓ | ✓ |
| Edit lyrics | ✗ (unless owner) | ✗ (unless owner) | ✓ (if owner) |
| View comments | ✓ | ✓ | ✓ |
| Add comments | ✓ | ✓ | ✓ |
| Approve comment edits | ✗ (unless owner) | ✗ (unless owner) | ✓ (if owner) |
| Create gig | ✗ | ✓ | ✗ |
| Edit gig | ✗ | ✓ | ✗ |
| Manage setlist | ✗ | ✓ | ✗ |
| Send message | ✓ | ✓ | ✓ |
| View settings | ✓ | ✓ | ✓ |
| Change password | ✓ | ✓ | ✓ |

---

## MVP vs. Future Features

### MVP (Screens 1–13)
- ✅ User authentication (invite codes)
- ✅ Song storage & browsing
- ✅ Tab upload & viewing (ChordPro rendering)
- ✅ Recording playback
- ✅ Comments (non-collaborative; future feature adds real-time collab)
- ✅ Gig creation & setlist management
- ✅ Threaded messaging
- ✅ Basic permissions (song writer, gig lead)

### Future Releases
- ❌ Real-time song writing collaboration
- ❌ Full offline mode
- ❌ Mobile app (native iOS/Android)
- ❌ Advanced search & filters
- ❌ Member management (add/remove)
- ❌ Attendance tracking
- ❌ Payment splits
- ❌ Push notifications

---

## Critical Paths (Happy Paths)

### Path 1: New User → First Song View
1. Welcome (1) → enter invite code
2. Sign-up (2) → create account
3. Success (3) → click "Go to app"
4. Home Feed (4/5) → click "Songs"
5. Songs List (6) → click song name
6. Song Detail (7) → view tabs, play recording
**Total steps: 6 | Time: ~5 min (first time)**

### Path 2: Gig Lead → Create Gig & Setlist
1. Home Feed (5) → click "Gigs"
2. Gigs List (9) → click "+ New Gig"
3. Create Gig (11) → enter venue, date, time
4. Setlist builder → select songs, reorder
5. Save → Gig Detail (10) shows new setlist
**Total steps: 5 | Time: ~10 min**

### Path 3: Member → Send Message
1. Home Feed (5) → click "Messages"
2. Messages (12) → type message
3. Click "Send" → message appears
4. Others reply → threaded conversation grows
**Total steps: 3 | Time: ~2 min per message**

---

## Accessibility Checklist

- [ ] All text passes WCAG AA contrast ratios
- [ ] Keyboard navigation enabled (Tab, Enter, Escape)
- [ ] Focus states clearly visible
- [ ] Form labels associated with inputs
- [ ] Error messages clearly stated
- [ ] Color not sole indicator of meaning (badges use text + color)
- [ ] Images/icons have alt text
- [ ] Buttons are 44px+ (touch-friendly)
- [ ] Modals/overlays have dismiss buttons
- [ ] Skip links or logical tab order
- [ ] Respects prefers-reduced-motion

---

## Testing Scenarios

### User Type 1: Band Member (No special role)
- Can view all songs, gigs, messages
- Can upload songs, edit tabs, comment
- Cannot create gigs, edit lyrics (unless writer)
- Can send/receive messages

### User Type 2: Gig Lead
- Everything a Band Member can do, PLUS:
- Can create gigs
- Can manage setlists (add/remove/reorder songs)
- Can edit gig details

### User Type 3: Song Writer (of a song)
- Can edit lyrics of their own song
- Can approve/deny comment edits on their lyrics
- Can do everything a Band Member can

### Test Scenario: New Gig Workflow
1. [Gig Lead] Creates gig: "Saturday Saloon, Oct 12, 9 PM"
2. [All members] See gig in Gigs List and Home Feed activity
3. [Gig Lead] Adds songs to setlist via drag-drop
4. [All members] See setlist order and song details
5. [Band Member] Views gig, sees 5 songs lined up, 20 min total
6. [Gig Lead] Edits setlist 1 hour before gig (reorder)
7. [All members] See updated setlist in real-time

---

## Success Metrics for MVP

- [ ] All 13 screens functional and navigable
- [ ] Onboarding completes in <10 minutes
- [ ] Song upload includes tabs + metadata
- [ ] Tab display renders ChordPro format correctly
- [ ] Gig setlist creation works with drag-drop
- [ ] Messages send/receive in real-time
- [ ] Permissions enforced (song writer, gig lead)
- [ ] Band can manage 100% of content in-app (no external tools)
- [ ] All 6 band members successfully onboarded
- [ ] Zero production bugs blocking core workflows

