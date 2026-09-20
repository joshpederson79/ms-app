// Parses ChordPro text into sections of { chords, lyric } line pairs.
// Chord positions are character offsets into the lyric, so the UI can render
// them in a monospace font directly above the lyric.
//
// Section headers: "[Verse 1]" alone on a line, or "{start_of_verse}"-style directives
// are not handled yet (see ChordPro_Parser_Spec.md).

const SECTION_NAMES = /^(verse|chorus|pre-?chorus|bridge|intro|outro|interlude)(\s+\d+)?$/i;
const CHORD_TOKEN = /\[([^\]]+)\]/g;

export function parseChordPro(source) {
  const sections = [];
  const warnings = [];
  let current = null;

  const startSection = (name) => {
    current = { name, lines: [] };
    sections.push(current);
  };

  for (const rawLine of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    const header = line.match(/^\[([^\]]+)\]$/);

    if (header && SECTION_NAMES.test(header[1].trim())) {
      startSection(header[1].trim());
      continue;
    }
    if (line.trim() === '') continue;

    if (!current) startSection('Verse');

    let lyric = '';
    const chords = [];
    let last = 0;
    for (const match of line.matchAll(CHORD_TOKEN)) {
      lyric += line.slice(last, match.index);
      chords.push({ name: match[1], offset: lyric.length });
      last = match.index + match[0].length;
    }
    lyric += line.slice(last);
    current.lines.push({ chords, lyric });
  }

  return { sections, warnings };
}

// Builds the two monospace strings (chord line above lyric line) for one parsed line.
export function renderLine({ chords, lyric }) {
  let chordLine = '';
  for (const { name, offset } of chords) {
    // Always leave at least one space between adjacent chords.
    if (chordLine.length > 0 && chordLine.length >= offset) chordLine += ' ';
    chordLine = chordLine.padEnd(offset, ' ') + name;
  }
  return { chordLine, lyric };
}
