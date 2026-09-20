import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import RoleManager from '../components/RoleManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS } from '../utils/permissions.js';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/onboarding/invite');
  };

  return (
    <div className="stack">
      <h2>Settings</h2>
      <div>
        <strong>{user.name}</strong>
        <div className="muted">{user.email}</div>
        <div className="muted">Role: {ROLE_LABELS[user.role] ?? user.role}{user.isAdmin && ' (Admin)'}</div>
      </div>
      {user.isAdmin && <RoleManager />}
      {/* TODO: preferences, change password, admin invite management */}
      <Button variant="secondary" onClick={signOut}>Sign out</Button>
    </div>
  );
}
