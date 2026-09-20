import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import OfflineButton from '../components/OfflineButton.jsx';
import Setlist from '../components/Setlist.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSetlist } from '../hooks/useSetlist.js';
import api from '../utils/api.js';
import { errorMessage } from '../utils/songPayload.js';

export default function SetlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setlist, loading, error, reload } = useSetlist(id);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');
  const [actionError, setActionError] = useState('');

  if (loading && !setlist) return <p className="muted">Loading…</p>;
  if (error || !setlist) return <p className="error-text">{error?.response?.status === 404 ? 'Setlist not found.' : 'Could not load this setlist.'}</p>;

  const canDelete = setlist.createdBy === user.id || user.isAdmin;

  const rename = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await api.patch(`/setlists/${setlist.id}`, { name });
      setRenaming(false);
      reload();
    } catch (err) {
      setActionError(errorMessage(err, 'Could not rename the setlist.'));
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete the setlist "${setlist.name}"? Gigs that already copied it are not affected.`)) return;
    try {
      await api.delete(`/setlists/${setlist.id}`);
      navigate('/app/setlists');
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete the setlist.'));
    }
  };

  return (
    <div className="stack">
      <Link to="/app/setlists" className="muted">← Setlists</Link>

      {renaming ? (
        <form className="row" onSubmit={rename}>
          <div style={{ flex: 1 }}><Input aria-label="Setlist name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
          <Button type="submit" disabled={!name.trim()}>Save</Button>
          <Button type="button" variant="secondary" onClick={() => setRenaming(false)}>Cancel</Button>
        </form>
      ) : (
        <header>
          <h1 style={{ marginBottom: '0.25rem' }}>{setlist.name}</h1>
          <div className="muted">by {setlist.createdByName ?? 'unknown'}</div>
        </header>
      )}

      <div className="row">
        {setlist.items.length > 0 && <Link to={`/stage/setlist/${setlist.id}/1`}><Button type="button">▶ Stage view</Button></Link>}
        <Button type="button" variant="secondary" onClick={() => { setName(setlist.name); setRenaming(true); }}>Rename</Button>
        {canDelete && <Button type="button" variant="secondary" onClick={remove}>Delete</Button>}
      </div>
      {actionError && <span className="error-text">{actionError}</span>}

      <OfflineButton kind="setlist" id={setlist.id} />

      <Setlist itemsPath={`/setlists/${setlist.id}/items`} stageBase={`/stage/setlist/${setlist.id}`} items={setlist.items} canManage onChanged={reload} />
    </div>
  );
}
