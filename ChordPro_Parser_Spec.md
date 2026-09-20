# ChordPro Parser & Conversion Specification

## Overview

Users upload tabs in **ChordPro format** (.txt files), which the backend parses and converts to **chord-over-lyric display format** for rendering on the Song Detail screen.

---

## ChordPro Format Specification

### Definition
ChordPro is a widely-used standard for storing song tabs with chord annotations. Chords are embedded in square brackets `[Chord]` directly within lyrics.

### Basic Syntax

```
[Verse 1]
[Em]Tell me what you [Am]need
[D]I'll give you what you [G]need

[Chorus]
[G]Take me somewhere [D]safe
[Em]Where I can be [Am]myself
```

### Supported Tags (Sections)

| Tag | Usage | Display |
|-----|-------|---------|
| `[Verse]` or `[Verse 1]` | Song verse | Labeled section header |
| `[Chorus]` | Song chorus | Labeled section header |
| `[Bridge]` | Bridge section | Labeled section header |
| `[Pre-Chorus]` | Pre-chorus | Labeled section header |
| `[Intro]` | Intro | Optional display |
| `[Outro]` | Outro | Optional display |
| `[Interlude]` | Instrumental break | Optional display |

### Supported Chord Names

All standard chord notation:
- **Root:** C, D, E, F, G, A, B
- **Accidentals:** Cb, C#, Db, D#, Eb, Fb, E#, F#, Gb, G#, Ab, A#, Bb, B#
- **Chord Types:** 
  - Major (no suffix): `C`, `Cm`, `C7`
  - Minor: `Cm`, `Cmin`, `C-`
  - Dominant 7th: `C7`
  - Major 7th: `Cmaj7`, `CM7`
  - Minor 7th: `Cm7`, `Cmin7`
  - Suspended: `Csus2`, `Csus4`
  - Added: `Cadd9`, `Cadd11`
  - Diminished: `Cdim`, `Cº`
  - Augmented: `Caug`, `C+`
  - Half-diminished: `Cm7b5`, `Cø`
  - Extensions: `C7#5`, `C7b9`, etc.

### Example Valid ChordPro Input

```
{title: Whiskey River}
{artist: Willie Nelson}
{key: E}
{tempo: 120}
{capo: 2}

[Verse 1]
[E]Well I've been drinking whiskey [B7]all night long
[E]Thinking 'bout you baby, [A]singing this sad song
[B7]Can't forget the way you left me [E]here

[Chorus]
[E]Whiskey river, [A]take my [E]mind
[B7]Wash my troubles [A]down the line
[E]Take me back to [A]yesterday

[Verse 2]
[E]You were my best friend, [B7]you were my love
[E]Now you're just a mem[A]ory I'm thinking of
[B7]Every bottle tells the story [E]true

[Chorus]
[E]Whiskey river, [A]take my [E]mind
[B7]Wash my troubles [A]down the line
[E]Take me back to [A]yesterday

[Bridge]
[A]I wish you'd come back home
[E]Leave me alone...

[Outro]
[E]Whiskey river
```

---

## Parsing Rules

### Input Validation

1. **File Type:** Accept `.txt` files or pasted text
2. **Encoding:** UTF-8
3. **Max Size:** 50KB (for a song, typically <10KB)
4. **Whitespace Handling:**
   - Preserve line breaks (each line = new lyric line)
   - Trim leading/trailing whitespace per line
   - Collapse multiple blank lines to one

### Chord Extraction

**Rule 1: Chord Recognition**
- Pattern: `[ChordName]` (case-insensitive inside brackets)
- Extract chord name and position (character index) within the line

**Rule 2: Position Calculation**
- Track character position of chord in original lyric line
- Store as `(chord_name, char_position)`
- Example: `[E]I've [Am]been` → `[(E, 0), (Am, 6)]`

**Rule 3: Chord Validation**
- Validate chord name against supported list
- Log warnings for unrecognized chords (but don't block upload)
- Examples of valid: C, Cm7, D#m, Gmaj7, Cadd9
- Examples of invalid: X, Czzz, Random

### Lyric Extraction

**Rule 4: Lyric Cleaning**
- Remove all `[ChordName]` brackets
- Keep lyric text as-is (preserve punctuation, capitalization, spacing)
- Example: `[E]I've [Am]been` → `I've been`

**Rule 5: Line Grouping**
- Each non-empty line = one lyric line
- Empty lines = section breaks
- Preserve line structure

### Section Detection

**Rule 6: Section Tags**
- Lines starting with `[Verse`, `[Chorus`, `[Bridge`, etc. = section headers
- Extract section name: `[Verse 1]` → "Verse 1"
- Section headers do NOT contain lyrics
- Next non-header line = first lyric of that section

**Rule 7: Unlabeled Lines**
- If a line contains chords but no section header above it, assume it follows previous section
- If no previous section, assume "Unlabeled" section

---

## Conversion Algorithm

### Step 1: Parse ChordPro Text

```
Input: Raw ChordPro text file

1. Split into lines
2. For each line:
   a. Detect if section header [Verse/Chorus/etc]
   b. Extract chords: find all [ChordName] patterns
   c. Extract lyrics: remove [ChordName] brackets
   d. Store as: {
        section: "Verse 1",
        chords: [(chord_name, position), ...],
        lyrics: "I've been drinking whiskey"
      }
```

### Step 2: Validate

```
For each chord extracted:
  - Check if valid chord name
  - If invalid: Log warning, remove from display (optional: keep in raw)
  
For each line:
  - Ensure at least one character of lyric
  - Ensure chords are within lyric bounds
```

### Step 3: Calculate Display Positions

```
For each lyric line:
  1. Render lyric in monospace font
  2. For each chord:
     a. Calculate pixel/character width from start to chord position
     b. Determine horizontal offset for chord name
     c. Store (chord_name, x_offset)
  3. Build two lines:
     - Line 1: chord names at calculated positions
     - Line 2: lyric text (unchanged)
```

### Step 4: Render Display Format

```
HTML/React Component receives:
  {
    section: "Verse 1",
    chord_line: [
      {name: "E", offset: 0},
      {name: "B7", offset: 24},
      {name: "E", offset: 32}
    ],
    lyric_line: "Well I've been drinking whiskey all night long"
  }

Render as:
  E                 B7            E
  Well I've been drinking whiskey all night long
```

---

## Display Rendering

### Component Structure

```jsx
<TabDisplay sections={parsedSections}>
  {sections.map(section => (
    <SectionBlock key={section.id} section={section}>
      <SectionHeader>{section.name}</SectionHeader>
      {section.lines.map(line => (
        <LyricLine key={line.id}>
          <ChordLine chords={line.chords} />
          <LyricText>{line.lyrics}</LyricText>
        </LyricLine>
      ))}
    </SectionBlock>
  ))}
</TabDisplay>
```

### CSS/Styling

```css
.chord-line {
  font-family: "Courier New", monospace;
  font-size: 12px;
  font-weight: 600;
  color: #A0714F;
  white-space: pre;
  line-height: 1.2;
}

.lyric-line {
  font-family: "Courier New", monospace;
  font-size: 12px;
  color: #e8e8e8;
  white-space: pre-wrap;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.section-header {
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  font-weight: 600;
  margin: 0.5rem 0 0.75rem 0;
}
```

### Monospace Alignment

**Key Challenge:** Chords must visually align above lyrics in monospace font.

**Solution:** Use character-width units for positioning.

```
Lyric: "I've been drinking"
         0123456789...

Chord E at position 0 → render at x=0
Chord Am at position 6 → render at x=6em (approx)

Display (both in monospace):
E           Am
I've been drinking
```

---

## Error Handling

### Invalid ChordPro Input

| Issue | Handling |
|-------|----------|
| Empty file | Show error: "No tabs found. Please upload a ChordPro file." |
| No lyrics (only chords) | Show error: "File contains chords but no lyrics." |
| Invalid chord names | Log warning, skip invalid chords, display valid ones |
| Malformed brackets `[Chord` | Treat as literal text (not a chord) |
| Mixed encodings | Convert to UTF-8, proceed |
| Extremely long lines (>200 chars) | Wrap in display, warn user |
| No sections detected | Assume entire file is one unnamed section |

### User Feedback

- **Success:** Display preview of first section with "X lines loaded"
- **Warnings:** Yellow alert icon + list of unrecognized chords
- **Errors:** Block upload, show specific error message with line number

---

## Data Storage

### ChordPro Source (Raw)
```json
{
  "tab_id": "abc123",
  "format": "chorpro",
  "raw_text": "[Verse 1]\n[E]Well I've...",
  "metadata": {
    "title": "Whiskey River",
    "artist": "Willie Nelson",
    "key": "E",
    "capo": "2",
    "tempo": 120
  }
}
```

### Display Format (Parsed)
```json
{
  "tab_id": "abc123",
  "sections": [
    {
      "id": "verse-1",
      "name": "Verse 1",
      "lines": [
        {
          "lyrics": "Well I've been drinking whiskey all night long",
          "chords": [
            {name: "E", position: 0},
            {name: "B7", position: 24}
          ]
        },
        ...
      ]
    },
    ...
  ]
}
```

Both formats stored in database; display format cached for performance.

---

## Editing Workflow (Future Enhancement)

When user clicks "Edit tab":

1. Load ChordPro source (raw_text)
2. Render in text editor with line numbers
3. User edits ChordPro format
4. On save:
   - Re-parse
   - Re-validate
   - Update both raw and display formats
   - Creates new major tab version (if substantial change)
   - Or inline minor update (if just chord tweaks)

---

## Test Cases

### Valid ChordPro

```
Input:
[Verse 1]
[Em]Tell me what you [Am]need

Expected Output:
{
  section: "Verse 1",
  lyrics: "Tell me what you need",
  chords: [(Em, 0), (Am, 16)]
}
```

### Invalid Chords (with warnings)

```
Input:
[Verse 1]
[Xyz]Tell me what [Am]you need

Expected Output:
{
  section: "Verse 1",
  lyrics: "Tell me what you need",
  chords: [(Am, 16)],
  warnings: ["Unrecognized chord: Xyz at line 1"]
}
```

### No Section Headers

```
Input:
[E]Well I've been [B7]drinking

Expected Output:
{
  section: "Unlabeled",
  lyrics: "Well I've been drinking",
  chords: [(E, 0), (B7, 16)]
}
```

### Multiple Sections

```
Input:
[Verse 1]
[E]Verse lyric [B7]here
[Chorus]
[G]Chorus [D]lyric

Expected Output:
[
  {section: "Verse 1", lyrics: "Verse lyric here", chords: [...]},
  {section: "Chorus", lyrics: "Chorus lyric", chords: [...]}
]
```

---

## Performance Notes

- **Parsing:** <100ms for typical song (100–500 lines)
- **Caching:** Cache display format in DB to avoid re-parsing on every view
- **Client-side:** No heavy rendering; simple HTML structure
- **Bandwidth:** Display format ~1.5x size of ChordPro source

---

## Future Enhancements

1. **Ultimate Guitar Import:** Auto-convert UG tabs to ChordPro format
2. **Chord Transposition:** Allow users to change key → recalculate chord names
3. **Tuning Variants:** Support alternate tunings (e.g., DADGAD)
4. **Lyric-to-Chord Sync:** Highlight chord as song plays (with recording)
5. **Collaborative Editing:** Real-time editing with version control
6. **Import from Other Formats:** GP5 (Guitar Pro), MIDI, ABC notation
7. **Export Options:** PDF (formatted tabs), MIDI, TablEdit format

