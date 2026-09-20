import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const ITEMS = [
  { to: '/app/home', label: 'Home', icon: '🏠' },
  { to: '/app/songs', label: 'Songs', icon: '🎵' },
  { to: '/app/gigs', label: 'Gigs', icon: '🎪' },
  { to: '/app/setlists', label: 'Setlists', icon: '📋' },
  { to: '/app/messages', label: 'Messages', icon: '💬' },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      {ITEMS.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <span aria-hidden="true">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
