import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AttachSetlist from '../components/AttachSetlist.jsx';
import Button from '../components/Button.jsx';
import OfflineButton from '../components/OfflineButton.jsx';
import Setlist from '../components/Setlist.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useGig } from '../hooks/useGig.js';
import api from '../utils/api.js';
import { isUpcoming, whenLabel } from '../utils/formatGig.js';
import { canManageGigs } from '../utils/permissions.js';
import { errorMessage } from '../utils/songPayload.js';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gig, loading, error, reload } = useGig(id);
  const [actionError, setActionError] = useState('');

  if (loading && !gig) return <p className="muted">Loading…</p>;
  if (error || !gig) return <p className="error-text">{error?.response?.status === 404 ? 'Gig not found.' : 'Could not load this gig.'}</p>;

  const canManage = canManageGigs(user);

  const deleteGig = async () => {
    if (!window.confirm(`Delete the gig at ${gig.venue}? Its setlist will be removed too.`)) return;
    try {
      await api.delete(`/gigs/${gig.id}`);
      navigate('/app/gigs');
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete the gig.'));
    }
  };

  return (
    <div className="stack">
      <Link to="/app/gigs" className="muted">← Gigs</Link>

      <header>
        <h1 style={{ marginBottom: '0.25rem' }}>{gig.venue}</h1>
        {gig.name && <div className="muted">{gig.name}</div>}
        <div className="muted">
          {whenLabel(gig)} • <StatusBadge kind={isUpcoming(gig.date) ? 'upcoming' : 'past'} />
        </div>
      </header>

      <Link to={`/app/messages?gig=${gig.id}`}>💬 Discuss this gig</Link>

      {canManage && (
        <div className="row">
          <Link to={`/app/gigs/${gig.id}/edit`}><Button type="button" variant="secondary">Edit gig</Button></Link>
          <Button variant="secondary" onClick={deleteGig}>Delete gig</Button>
        </div>
      )}
      {actionError && <span className="error-text">{actionError}</span>}

      <div className="row">
        {gig.setlist.length > 0 && <Link to={`/stage/gig/${gig.id}/1`}><Button type="button">▶ Stage view</Button></Link>}
      </div>
      <OfflineButton kind="gig" id={gig.id} />
      {canManage && <AttachSetlist gigId={gig.id} onAttached={reload} />}

      <Setlist itemsPath={`/gigs/${gig.id}/setlist`} stageBase={`/stage/gig/${gig.id}`} items={gig.setlist} canManage={canManage} onChanged={reload} />
    </div>
  );
}
