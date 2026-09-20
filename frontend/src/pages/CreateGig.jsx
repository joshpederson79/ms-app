import { Navigate, useNavigate, useParams } from 'react-router-dom';
import GigForm from '../components/GigForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useGig } from '../hooks/useGig.js';
import { canManageGigs } from '../utils/permissions.js';

// Serves both /app/gigs/create and /app/gigs/:id/edit.
export default function CreateGig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gig, loading, error } = useGig(id);

  if (!canManageGigs(user)) return <Navigate to="/app/gigs" replace />;
  if (id && loading) return <p className="muted">Loading…</p>;
  if (id && (error || !gig)) return <p className="error-text">Gig not found.</p>;

  return (
    <GigForm
      gig={id ? gig : undefined}
      onSaved={(saved) => navigate(`/app/gigs/${saved.id}`)}
      onCancel={() => navigate(id ? `/app/gigs/${id}` : '/app/gigs')}
    />
  );
}
