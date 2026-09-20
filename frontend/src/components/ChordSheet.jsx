import styles from './ChordSheet.module.css';

// Renders the parsed ChordPro (tabs.display_format) as chords over lyrics.
// Expects { sections: [{ name, lines: [{ chords: [{ name, offset }], lyric }] }] }.
// Keep the chord-line layout in sync with renderLine in backend/src/utils/parseChordPro.js.
function chordLine(chords) {
  let line = '';
  for (const { name, offset } of chords) {
    if (line.length > 0 && line.length >= offset) line += ' ';
    line = line.padEnd(offset, ' ') + name;
  }
  return line;
}

export default function ChordSheet({ sections = [] }) {
  return (
    <div className={styles.sheet}>
      {sections.map((section, i) => (
        <section key={i}>
          <h3>{section.name}</h3>
          {section.lines.map((line, j) => (
            <pre key={j} className={styles.line}>
              {line.chords.length > 0 && <span className={styles.chords}>{chordLine(line.chords)}{'\n'}</span>}
              <span className={styles.lyric}>{line.lyric}</span>
            </pre>
          ))}
        </section>
      ))}
    </div>
  );
}
