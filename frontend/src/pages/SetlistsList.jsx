import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import OfflinePacks from '../components/OfflinePacks.jsx';
import api from '../utils/api.js';
import { errorMessage } from '../utils/songPayload.js';

export default function SetlistsList() {
  const navigate = useNavigate();
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/setlists').then(({ data }) => setSetlists(data)).catch(() => setLoadError(true)).finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/setlists', { name });
      navigate(`/app/setlists/${data.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Could not create the setlist.'));
    }
  };

  return (
    <div className="stack">
      <Link to="/app/gigs" className="muted">← Gigs</Link>
      <h2 style={{ marginBottom: 0 }}>Setlists</h2>
      <p className="muted">Saved song lists you can open on their own or copy onto a gig.</p>

      <form className="row" onSubmit={create}>
        <div style={{ flex: 1 }}>
          <Input aria-label="New setlist name" placeholder="New setlist name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
        </div>
        <Button type="submit" disabled={!name.trim()}>+ Create</Button>
      </form>
      {error && <span className="error-text">{error}</span>}

      {loadError && <p className="error-text">Could not load setlists. Check your connection.</p>}
      {!loadError && !loading && setlists.length === 0 && <p className="muted">No setlists yet.</p>}
      {setlists.map((setlist) => (
        <Card key={setlist.id} as={Link} to={`/app/setlists/${setlist.id}`} interactive>
          <strong>{setlist.name}</strong>
          <div className="muted">
            {setlist.songCount} {setlist.songCount === 1 ? 'song' : 'songs'} • by {setlist.createdByName ?? 'unknown'}
          </div>
        </Card>
      ))}

      <OfflinePacks kind="setlist" />
    </div>
  );
}
