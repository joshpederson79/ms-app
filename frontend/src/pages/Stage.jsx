import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChordSheet from '../components/ChordSheet.jsx';
import { useAutoScroll } from '../hooks/useAutoScroll.js';
import { useStagePack } from '../hooks/useStagePack.js';
import { useWakeLock, wakeLockSupported } from '../hooks/useWakeLock.js';
import { formatMessageTime } from '../utils/formatMessage.js';
import styles from './Stage.module.css';

const FONT = { min: 12, max: 44, step: 2, initial: 20 };
const SPEEDS = [
  { label: 'Slow', pxPerSecond: 12 },
  { label: 'Medium', pxPerSecond: 24 },
  { label: 'Fast', pxPerSecond: 48 },
];
const FONT_KEY = 'ms_stage_font';
const SPEED_KEY = 'ms_stage_speed';

// Remembered between songs and sessions; falls back if storage is unavailable.
const stored = (name, fallback) => {
  try {
    const value = Number(localStorage.getItem(name));
    return Number.isFinite(value) && localStorage.getItem(name) !== null ? value : fallback;
  } catch {
    return fallback;
  }
};
const remember = (name, value) => {
  try {
    localStorage.setItem(name, String(value));
  } catch {
    /* ignore */
  }
};

const tabDetails = (tab) =>
  [
    tab.key && `Key ${tab.key}`,
    tab.capo != null && `Capo ${tab.capo}`,
    tab.tuning && tab.tuning,
    tab.tempo && `${tab.tempo} BPM`,
  ]
    .filter(Boolean)
    .join(' • ');

// Full-screen, distraction-free chart for performing. kind: 'song' | 'gig' | 'setlist'.
export default function Stage({ kind }) {
  const { id, pos } = useParams();
  const navigate = useNavigate();
  const { pack, loading, error, savedAt } = useStagePack(kind, id);

  const [fontSize, setFontSize] = useState(() => stored(FONT_KEY, FONT.initial));
  const [speedIndex, setSpeedIndex] = useState(() => Math.min(stored(SPEED_KEY, 1), SPEEDS.length - 1));
  const [scrolling, setScrolling] = useState(false);
  const [awake, setAwake] = useState(true);

  const entries = pack?.entries ?? [];
  const index = Math.min(Math.max((Number(pos) || 1) - 1, 0), Math.max(entries.length - 1, 0));
  const entry = entries[index];

  useWakeLock(awake);
  useAutoScroll(scrolling, SPEEDS[speedIndex].pxPerSecond);

  const exitTo = kind === 'song' ? `/app/songs/${id}` : `/app/${kind === 'gig' ? 'gigs' : 'setlists'}/${id}`;
  const go = useCallback(
    (target) => {
      if (target >= 0 && target < entries.length) navigate(`/stage/${kind}/${id}/${target + 1}`, { replace: true });
    },
    [entries.length, kind, id, navigate]
  );

  // A new song starts at the top with auto-scroll off.
  useEffect(() => {
    window.scrollTo(0, 0);
    setScrolling(false);
  }, [index, id]);

  // Arrow keys (and foot pedals that send them) change song; space toggles auto-scroll.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === ' ') {
        e.preventDefault();
        setScrolling((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  const changeFont = (delta) => {
    const next = Math.min(FONT.max, Math.max(FONT.min, fontSize + delta));
    setFontSize(next);
    remember(FONT_KEY, next);
  };
  const cycleSpeed = () => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    remember(SPEED_KEY, next);
  };

  const exit = <button type="button" className={`${styles.btn} ${styles.exit}`} onClick={() => navigate(exitTo)} aria-label="Exit stage view">✕</button>;

  if (loading) return <div className={styles.stage}><p className={`${styles.message} muted`}>Loading…</p></div>;
  if (error || !entry) {
    return (
      <div className={styles.stage}>
        <div className={styles.message}>
          {exit}
          <p className={error ? 'error-text' : 'muted'}>
            {error ? (error.response?.status === 404 ? 'Not found.' : 'Could not load this. Check your connection.') : 'This setlist has no songs yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stage} style={{ '--stage-font': `${fontSize}px` }}>
      <header className={styles.top}>
        {exit}
        <div className={styles.title}>
          <h1>{entry.songName}</h1>
          {entry.tab && <div className={styles.meta}>{tabDetails(entry.tab)}</div>}
        </div>
        {entries.length > 1 && <span className={styles.count}>{index + 1} / {entries.length}</span>}
      </header>

      {savedAt && <div className={styles.banner}>Showing your offline copy (saved {formatMessageTime(savedAt)})</div>}

      <main className={styles.content}>
        {entry.tab ? <ChordSheet sections={entry.tab.displayFormat?.sections} /> : <p className="muted">No tab for this song yet.</p>}
      </main>

      <footer className={styles.controls}>
        {entries.length > 1 && <button type="button" className={styles.btn} onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous song">◀ Prev</button>}
        <button type="button" className={styles.btn} onClick={() => changeFont(-FONT.step)} disabled={fontSize <= FONT.min} aria-label="Smaller text">A−</button>
        <button type="button" className={styles.btn} onClick={() => changeFont(FONT.step)} disabled={fontSize >= FONT.max} aria-label="Larger text">A+</button>
        <button type="button" className={styles.btn} aria-pressed={scrolling} onClick={() => setScrolling((v) => !v)}>{scrolling ? '⏸ Scroll' : '▶ Scroll'}</button>
        <button type="button" className={styles.btn} onClick={cycleSpeed} aria-label="Change scroll speed">{SPEEDS[speedIndex].label}</button>
        {wakeLockSupported && (
          <button type="button" className={styles.btn} aria-pressed={awake} onClick={() => setAwake((v) => !v)} aria-label="Keep screen awake">🔆 Awake</button>
        )}
        {entries.length > 1 && <button type="button" className={styles.btn} onClick={() => go(index + 1)} disabled={index === entries.length - 1} aria-label="Next song">Next ▶</button>}
      </footer>
    </div>
  );
}
