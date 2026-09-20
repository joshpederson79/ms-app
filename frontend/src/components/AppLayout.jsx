import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BottomNav from './BottomNav.jsx';

export default function AppLayout() {
  const { user } = useAuth();
  return (
    <>
      <header className="page" style={{ paddingBottom: 0, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ letterSpacing: '2px', marginBottom: 0 }}>Moonshine Saints</h1>
          <span className="muted">Hey, {user?.name}</span>
        </div>
        <Link to="/app/settings" aria-label="Settings">⚙️</Link>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
