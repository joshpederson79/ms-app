import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useGigs } from '../hooks/useGigs.js';
import { isUpcoming, whenLabel } from '../utils/formatGig.js';
import { canManageGigs } from '../utils/permissions.js';

function GigCard({ gig, upcoming }) {
  return (
    <Card as={Link} to={`/app/gigs/${gig.id}`} interactive>
      <div className="row between">
        <strong>{gig.venue}</strong>
        <StatusBadge kind={upcoming ? 'upcoming' : 'past'} />
      </div>
      {gig.name && <div className="muted">{gig.name}</div>}
      <div className="muted">{whenLabel(gig)}</div>
      <div className="muted">
        {gig.songCount > 0 ? `${gig.songCount} ${gig.songCount === 1 ? 'song' : 'songs'} in setlist` : 'Setlist pending'}
      </div>
    </Card>
  );
}

export default function GigsList() {
  const { user } = useAuth();
  const { data: gigs, loading, error } = useGigs();

  // The API returns gigs oldest-first: upcoming reads soonest-first, past reads most-recent-first.
  const upcoming = gigs.filter((g) => isUpcoming(g.date));
  const past = gigs.filter((g) => !isUpcoming(g.date)).reverse();

  return (
    <div className="stack">
      <div className="row between">
        <h2 style={{ marginBottom: 0 }}>Gigs</h2>
        {canManageGigs(user) && <Link to="/app/gigs/create"><Button type="button">+ New Gig</Button></Link>}
      </div>

      {error && <p className="error-text">Could not load gigs.</p>}
      {!error && !loading && gigs.length === 0 && <p className="muted">No gigs yet.</p>}

      {upcoming.length > 0 && <h3>Upcoming</h3>}
      {upcoming.map((gig) => <GigCard key={gig.id} gig={gig} upcoming />)}

      {past.length > 0 && <h3>Past</h3>}
      {past.map((gig) => <GigCard key={gig.id} gig={gig} upcoming={false} />)}
    </div>
  );
}
