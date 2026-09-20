import { useState } from 'react';
import Button from './Button.jsx';
import { formatMessageTime } from '../utils/formatMessage.js';
import { getPack, removePack, savePack } from '../utils/offline.js';
import { fetchPack } from '../utils/stagePack.js';

// Saves a gig's or setlist's songs and tabs on this device so stage view works with no signal.
export default function OfflineButton({ kind, id }) {
  const [saved, setSaved] = useState(() => getPack(kind, id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      savePack(kind, id, await fetchPack(kind, id));
      setSaved(getPack(kind, id));
    } catch (err) {
      setError(err.response ? 'Could not download the tabs.' : err.name === 'QuotaExceededError' ? 'Not enough storage on this device.' : 'Could not save. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    try {
      removePack(kind, id);
    } catch {
      /* ignore */
    }
    setSaved(null);
  };

  return (
    <div className="stack">
      <div className="row">
        <Button type="button" variant="secondary" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : saved ? '↻ Update offline copy' : '⬇ Save for offline'}
        </Button>
        {saved && <Button type="button" variant="secondary" onClick={remove}>Remove offline copy</Button>}
      </div>
      {saved && <span className="muted">✓ Saved for offline ({formatMessageTime(saved.savedAt)}). Stage view works without a connection.</span>}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
