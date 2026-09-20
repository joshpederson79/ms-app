import styles from './StatusBadge.module.css';

// kind: 'final' | 'wip' | 'duet' | 'upcoming' | 'past' | 'resolved'. Text always accompanies color.
const LABELS = { final: 'Final', wip: 'WIP', duet: 'Duet', upcoming: 'Upcoming', past: 'Past', resolved: 'Resolved' };

export default function StatusBadge({ kind }) {
  return <span className={`${styles.badge} ${styles[kind]}`}>{LABELS[kind]}</span>;
}
