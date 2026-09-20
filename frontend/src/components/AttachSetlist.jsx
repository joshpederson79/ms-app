import { useState } from 'react';
import Button from './Button.jsx';
import api from '../utils/api.js';
import { errorMessage } from '../utils/songPayload.js';

// Gig Leads: copy a saved setlist's songs onto the end of this gig's setlist.
export default function AttachSetlist({ gigId, onAttached }) {
  const [open, setOpen] = useState(false);
  const [setlists, setSetlists] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const toggle = async () => {
    setOpen((v) => !v);
    if (!setlists) {
      try {
        setSetlists((await api.get('/setlists')).data);
      } catch (err) {
        setError(errorMessage(err, 'Could not load setlists.'));
      }
    }
  };

  const attach = async (setlist) => {
    setError('');
    setMessage('');
    try {
      const { data } = await api.post(`/gigs/${gigId}/setlist/attach`, { setlist_id: setlist.id });
      setMessage(
        `Added ${data.added} ${data.added === 1 ? 'song' : 'songs'} from "${setlist.name}"` +
          (data.skipped ? `; skipped ${data.skipped} (already on this gig or no longer Final).` : '.')
      );
      onAttached();
    } catch (err) {
      setError(errorMessage(err, 'Could not attach that setlist.'));
    }
  };

  return (
    <div className="stack">
      <Button type="button" variant="secondary" onClick={toggle}>{open ? 'Close' : 'Attach saved setlist'}</Button>
      {open && setlists?.length === 0 && <p className="muted">No saved setlists yet. Create one under Gigs → Setlists.</p>}
      {open && setlists?.map((setlist) => (
        <div key={setlist.id} className="row between">
          <span>{setlist.name} <span className="muted">• {setlist.songCount} {setlist.songCount === 1 ? 'song' : 'songs'}</span></span>
          <Button type="button" variant="secondary" onClick={() => attach(setlist)}>Add to gig</Button>
        </div>
      ))}
      {message && <span className="muted" role="status">{message}</span>}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
