# Moonshine Saints — UI Design System & Screen Inventory

**Version:** 1.0  
**Date:** September 19, 2026  
**Platform:** Web App (Desktop/Tablet)  
**Theme:** Dark with Copper/Bronze Accents

---

## Design System Overview

### Color Palette

**Primary Colors:**
- **Dark Navy** (#1B2D3D) — Primary background, cards, containers
- **Dark Background** (#0F1419) — Page/feed background
- **Copper/Bronze** (#A0714F) — Primary accent, buttons, highlights (main brand color)
- **Cream/Tan** (#D4C5A0) — Secondary accent, headings, band identity
- **Silver** (#C0C0C0) — Secondary accent, duet badges, subtle highlights

**Semantic Colors:**
- **Dark Accent** (#4A5D73) — Borders, dividers, muted UI
- **Text Primary** (#E8E8E8) — Main body text
- **Text Secondary** (#999999) — Supporting text, labels
- **Text Muted** (#666666) — Hints, placeholders

### Typography

**Headlines (Band Identity):**
- Font: Georgia, serif
- Weight: Normal (400)
- Sizes: 20px (h1), 18px (h2), 16px (h3)
- Spacing: Letter-spacing 1-2px for band name

**Body & UI (Readability):**
- Font: System default sans-serif (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- Weight: 400 (regular), 500 (bold/medium), 600 (semi-bold for buttons)
- Sizes: 13px (body), 12px (UI), 11px (labels/captions), 10px (meta)
- Line-height: 1.6–1.8

### Spacing

- Padding: 1.5rem (sections), 1rem (cards), 0.75rem (inputs)
- Margin: 1.5rem (sections), 1rem (blocks), 0.5rem (inline)
- Gap: 0.75rem (form rows), 1rem (content sections), 2rem (page sections)
- Border-radius: 8px (containers), 4px (forms/buttons)

### Components

**Buttons:**
- Primary: Copper background (#A0714F), white text, 0.75rem padding
- Secondary: Transparent background, border 1px #4A5D73, text #999
- States: Hover (darker copper), active (scale 0.98)

**Inputs:**
- Background: #1B2D3D
- Border: 1px solid #4A5D73
- Focus: Border color changes to #A0714F
- Padding: 0.75rem
- Border-radius: 4px

**Cards:**
- Background: #1B2D3D
- Border: 1px solid #4A5D73 (optional)
- Padding: 1rem–1.5rem
- Border-radius: 8px
- Hover: Background #2a3d4f

**Status Badges:**
- Final: Background rgba(160, 113, 79, 0.3), text #A0714F
- WIP/Draft: Background rgba(160, 113, 79, 0.2), text #A0714F
- Duet: Background rgba(192, 192, 192, 0.2), text #C0C0C0
- Font-size: 10px, padding: 0.3rem 0.6rem, border-radius: 3px

---

## Screen Inventory

### Onboarding Flow (4 screens)

#### 1. Welcome / Invite Code Entry
**Purpose:** First screen users see after visiting the app  
**Key Elements:**
- Moonshine Saints logo/band name (prominent)
- Invite code input
- "Continue" button
- Helper text: "Don't have a code? Contact your band leader"
**Interactions:**
- User enters invite code
- Validates against backend
- On success → proceeds to sign-up screen
- On failure → shows error message

#### 2. Sign-up Form
**Purpose:** Create user account with name, email, password  
**Key Elements:**
- "Create your account" heading
- Full name input
- Email input
- Password input (with strength guidance)
- "Create account" button
- "Cancel" button
**Interactions:**
- Form validation on each field
- Password strength meter (optional MVP+)
- On success → shows success screen

#### 3. Success Confirmation
**Purpose:** Confirms account creation  
**Key Elements:**
- Checkmark icon/graphic
- "Account created!" heading
- Welcome message with band name
- "Go to home feed" button
- Helper text: "Your admin will assign your role shortly"
**Interactions:**
- User clicks button to enter app
- Redirects to home feed

#### 4. Home Feed (Onboarding Complete)
**Purpose:** First view of the app after signup  
**Key Elements:**
- Header with band name and personalized greeting
- "Recent activity" section
- Feed of mixed updates (songs, gigs, messages, comments)
- Bottom navigation (Home, Songs, Gigs, Messages)
**Interactions:**
- Clickable feed items
- Navigation to detail screens
- Seamless transition into app

---

### Core Features (8+ screens)

#### 5. Home Feed (Full Version)
**Purpose:** Central hub showing all band activity  
**Key Elements:**
- Header: Band name, user greeting, settings button
- Filter/search (future feature)
- Activity feed items:
  - Song uploads (with status badge)
  - Gig posts (date/venue)
  - Messages (thread preview)
  - Comments on songs
- Each item shows: type icon, action description, timestamp
- Bottom navigation

**Feed Item Types:**
- 🎵 Song uploaded
- 🎪 Gig posted
- 💬 New message
- 💭 Comment on song

#### 6. Songs List
**Purpose:** Browse and search all band songs  
**Key Elements:**
- Header: "Songs" title, "+ Upload" button
- Search input
- Filter buttons: Final, WIP, All Lead Singers
- Song list items showing:
  - Song name
  - Lead singer name
  - Status (Final/WIP)
  - Number of tab versions
- Each item is clickable

**Song Item Display:**
```
[Song name]
Lead: [Singer] • [Status]
[#] versions
```

#### 7. Song Detail
**Purpose:** View/edit song, tabs, lyrics, recordings, comments  
**Key Elements:**
- Header: Song name (serif), lead singer, status
- Metadata grid: Key, Tempo, Capo, Tuning
- Tabs navigation: Tab, Recording, Versions
- Tab view:
  - ChordPro format rendered (chords over lyrics)
  - Editable fields: chords, key, tempo, capo (anyone)
  - Song writer can edit lyrics only
- Recording player
- Comments section (threaded)

**Tab Example Format:**
```
[E]Well I've been drinking whiskey
[B7]All night long
[E]Thinking 'bout you baby
[A]Singing this sad song
```

#### 8. Upload Song
**Purpose:** Add a new song to the band library  
**Key Elements:**
- Form fields:
  - Song name (required)
  - Lead singer dropdown (required)
  - Song writer dropdown (required)
  - Status radio buttons: WIP / Final (required)
  - Tab upload area (drag & drop or file picker)
  - Tab metadata: Key, Tempo, Capo, Tuning
  - Recording upload area
- Buttons: "Save song", "Cancel"
- Tab format support: ChordPro .txt, .pdf, Ultimate Guitar link/file

#### 9. Gigs List
**Purpose:** Browse upcoming and past gigs  
**Key Elements:**
- Header: "Gigs" title, "+ New Gig" button
- Gig list items showing:
  - Venue name
  - Date & time
  - Number of songs in setlist (or "Setlist pending")
  - Status badge: Upcoming / Past
- Items are clickable

**Gig Item Display:**
```
[Venue name]
[Date], [Time]
[#] songs in setlist
```

#### 10. Gig Detail / Setlist Builder
**Purpose:** View gig details and manage setlist  
**Key Elements:**
- Header: Venue name (serif), date & time
- Setlist section:
  - "Setlist ([#] songs)" header
  - "+ Add song" button
  - Ordered list of songs:
    - Drag handle (⋮) for reordering
    - Song position number (1, 2, 3, etc.)
    - Song name
    - Lead singer name
    - Song length
  - Total setlist time displayed
- Only "Final" songs can be added to setlist
- Drag-and-drop reordering enabled

**Setlist Item Display:**
```
⋮ [#] [Song name]
    [Singer] • [Duration]
```

#### 11. Create/Edit Gig
**Purpose:** Create new gig or edit existing gig  
**Key Elements:**
- Form fields:
  - Venue name (required)
  - Date picker (required)
  - Time picker (required)
  - Setlist builder (see screen 10)
- Buttons: "Save gig", "Cancel"
- Auto-calculates setlist time

#### 12. Messages / Threaded Chat
**Purpose:** Send messages, start threads, discuss songs/gigs  
**Key Elements:**
- Header: "Messages" title, search button
- Messages area:
  - User avatar (initials in circle)
  - User name & timestamp
  - Message content in styled bubble
  - Your messages: right-aligned, copper background
  - Others' messages: left-aligned, dark background
  - Threaded replies with visual nesting
- Input area at bottom:
  - Text input
  - "Send" button
- Message search (full-text, future MVP+)

#### 13. Settings
**Purpose:** User profile, preferences, account management  
**Key Elements:**
- Profile section:
  - User avatar
  - Full name
  - Email address
  - "Edit profile" link
- Account section:
  - Role display (Band Member, Gig Lead, Song Writer)
  - Join date
  - "Change password" button
- Preferences section:
  - Email notifications toggle
  - Message digest toggle
- Danger zone:
  - "Sign out" button

---

## Interaction Patterns

### Navigation

**Primary Navigation (Bottom):**
- Home (🏠)
- Songs (🎵)
- Gigs (🎪)
- Messages (💬)

**Secondary Navigation:**
- Settings (⚙️) in header
- Back button (implicit or explicit)
- Breadcrumbs (future feature)

### Form Validation

**Real-time:**
- Email format validation
- Required field indicators
- Password strength meter

**On Submit:**
- All required fields checked
- Error messages displayed inline
- User guided to fix issues

### Content Organization

**By Lead Singer:**
- Tabs/filters in Songs list
- Users can see songs grouped by who leads them

**By Status:**
- Filter buttons: Final, WIP, All
- Users can see draft vs. finished content

**By Date:**
- Gigs sorted by upcoming/past
- Feed items chronologically ordered

### Permissions Visual Indicators

**Song Writer Control:**
- Lyrics field shows lock icon or "edit by song writer only"
- Comments on lyrics marked as "awaiting approval"

**Gig Lead Control:**
- "Manage setlist" button only visible to gig leads
- Edit controls on gig items

---

## Dark Theme Implementation

### Background Hierarchy

| Element | Color | Usage |
|---------|-------|-------|
| Page background | #0F1419 | Feed, main content areas |
| Card/container | #1B2D3D | Songs, gigs, messages, forms |
| Hover state | #2a3d4f | Subtle feedback on interactive items |
| Border | #4A5D73 | Dividers, input borders |

### Text Hierarchy

| Level | Color | Usage |
|-------|-------|-------|
| Primary | #E8E8E8 | Body text, song names, main content |
| Secondary | #999999 | Supporting text, labels, metadata |
| Muted | #666666 | Placeholders, hints, timestamps |
| Accent | #D4C5A0 | Headings (serif), band identity |

### Accessibility

- All text meets WCAG AA contrast ratios
- Focus states clearly visible (outline or background change)
- Buttons and interactive elements 44px+ (mobile-ready)
- Color alone does not convey meaning (badges use text + color)

---

## Future Enhancements (Post-MVP)

- **Mobile app:** Native iOS/Android with native components
- **Song writing collab:** Real-time editing, inline comments on sections
- **Offline mode:** Sync-on-reconnect, local cache of all content
- **Gig details:** Attendance tracking, load-out checklist, payment tracking
- **Advanced search:** Filters by date, instrument, etc.
- **Notifications:** Real-time push notifications, email digests
- **File storage:** Cloud backup, version history with timestamps
- **Member management:** Add/remove band members, role assignment UI

---

## Developer Notes

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Responsive Breakpoints
- Desktop: 1024px+ (current mockups)
- Tablet: 768px–1023px (optimized layout)
- Mobile: 320px–767px (future, not MVP)

### File Handling
- Tab uploads: .txt (ChordPro), .pdf, or Ultimate Guitar links/imports
- Recording uploads: .mp3, YouTube links, voice memos
- Max file size: TBD (depends on hosting)

### Data Relationships
- Song ← multiple Tabs (versions)
- Tab ← one Recording
- Song ← one Lead Singer (or duet)
- Song ← one Song Writer (controls lyrics)
- Gig ← one to many Setlist Items
- Setlist Item ← one Song (must be Final status)
- Message ← one or more Replies (threaded)

### Search & Filtering
- Songs: by name, lead singer, status (Final/WIP)
- Gigs: by date range, venue (future)
- Messages: full-text search (future MVP+)
- Recordings: by song name, date (future)

---

## Screen Matrix

| Screen | Purpose | Status | Priority | Notes |
|--------|---------|--------|----------|-------|
| Welcome | Invite code entry | Designed | MVP | Onboarding step 1 |
| Sign-up | Create account | Designed | MVP | Onboarding step 2 |
| Success | Account confirmation | Designed | MVP | Onboarding step 3 |
| Home Feed | Activity hub | Designed | MVP | Central hub, v1 shows 4 activity types |
| Songs List | Browse songs | Designed | MVP | Filterable, searchable |
| Song Detail | View/edit song, tabs, comments | Designed | MVP | Tab rendering, comments, metadata |
| Upload Song | Add new song | Designed | MVP | Form with drag-drop, metadata |
| Gigs List | Browse gigs | Designed | MVP | Sortable by date |
| Gig Detail | View/manage setlist | Designed | MVP | Drag-drop reorder, final songs only |
| Create Gig | New gig form | Designed | MVP | Date/time pickers, setlist builder |
| Messages | Chat & threads | Designed | MVP | Threaded conversations |
| Settings | Profile & preferences | Designed | MVP | Basic account settings |

---

## Implementation Checklist

- [ ] Design tokens (colors, typography, spacing) in CSS/SCSS
- [ ] Component library (buttons, cards, inputs, modals)
- [ ] Page templates (onboarding, home, list views, detail views)
- [ ] Form validation logic
- [ ] Navigation structure & routing
- [ ] State management (auth, user data, content)
- [ ] API integration (create, read, update, delete operations)
- [ ] Tab rendering (ChordPro parser)
- [ ] Recording player (audio player component)
- [ ] Messaging system (threaded conversations)
- [ ] Search & filtering logic
- [ ] Permissions enforcement (UI only for MVP; backend validates)
- [ ] Error handling & user feedback
- [ ] Responsive design testing
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance optimization
- [ ] User testing & feedback iteration

