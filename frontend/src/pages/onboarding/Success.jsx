import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';

export default function Success() {
  const navigate = useNavigate();
  return (
    <div className="page stack">
      <h2>✓ Account created!</h2>
      <p>Welcome to Moonshine Saints.</p>
      <Button onClick={() => navigate('/app/home')}>Go to home feed</Button>
      <p className="muted">Your admin will assign your role shortly.</p>
    </div>
  );
}
