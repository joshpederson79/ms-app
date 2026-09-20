import styles from './StatusBadge.module.css';

// kind: 'final' | 'wip' | 'duet'. Text always accompanies color.
const LABELS = { final: 'Final', wip: 'WIP', duet: 'Duet' };

export default function StatusBadge({ kind }) {
  return <span className={`${styles.badge} ${styles[kind]}`}>{LABELS[kind]}</span>;
}
