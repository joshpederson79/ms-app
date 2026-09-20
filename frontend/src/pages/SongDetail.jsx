import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ChordSheet from '../components/ChordSheet.jsx';
import SongEditForm from '../components/SongEditForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import TabEditForm from '../components/TabEditForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSong } from '../hooks/useSong.js';
import { useUsers } from '../hooks/useUsers.js';
import api from '../utils/api.js';
import { errorMessage } from '../utils/songPayload.js';

const show = (value) => value ?? '—';
const formatDate = (iso) => new Date(iso).toLocaleDateString();

export default function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { song, loading, error, reload } = useSong(id);

  const [view, setView] = useState('tab'); // 'tab' | 'versions'
  const [mode, setMode] = useState(null); // null | 'editSong' | 'editTab' | 'newVersion'
  const [viewedTab, setViewedTab] = useState(null); // an older version chosen from history
  const [actionError, setActionError] = useState('');

  if (loading && !song) return <p className="muted">Loading…</p>;
  if (error || !song) return <p className="error-text">{error?.response?.status === 404 ? 'Song not found.' : 'Could not load this song.'}</p>;

  const latest = song.latestTab;
  const tab = viewedTab ?? latest;
  const isLatest = !viewedTab || viewedTab.id === latest?.id;
  const isSongWriter = song.songwriters.includes(user.id) || user.isAdmin;

  const done = () => {
    setMode(null);
    setViewedTab(null);
    reload();
  };

  const viewVersion = async (versionId) => {
    setActionError('');
    try {
      setViewedTab((await api.get(`/tabs/${versionId}`)).data);
      setView('tab');
    } catch (err) {
      setActionError(errorMessage(err, 'Could not load that version.'));
    }
  };

  const deleteSong = async () => {
    if (!window.confirm(`Delete "${song.name}" and all its tabs? This can't be undone.`)) return;
    try {
      await api.delete(`/songs/${song.id}`);
      navigate('/app/songs');
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete the song.'));
    }
  };

  if (mode === 'editSong') {
    return <SongEditForm song={song} users={users} canEditLyrics={isSongWriter} onSaved={done} onCancel={() => setMode(null)} />;
  }
  if (mode === 'editTab' || mode === 'newVersion') {
    return (
      <TabEditForm
        mode={mode === 'editTab' ? 'edit' : 'new'}
        songId={song.id}
        tab={mode === 'editTab' ? tab : latest}
        onSaved={done}
        onCancel={() => setMode(null)}
      />
    );
  }

  return (
    <div className="stack">
      <Link to="/app/songs" className="muted">← Songs</Link>

      <header>
        <h1 style={{ marginBottom: '0.25rem' }}>{song.name}</h1>
        <div className="muted">
          Lead: {song.leadSingerName}
          {song.isDuet && ` & ${song.secondSingerName}`} •{' '}
          <StatusBadge kind={song.status === 'Final' ? 'final' : 'wip'} />
          {song.isDuet && <> <StatusBadge kind="duet" /></>}
        </div>
        <div className="muted">Written by {song.songwriterList.map((w) => w.name).join(', ')}</div>
      </header>

      <div className="row">
        <Button variant="secondary" onClick={() => setMode('editSong')}>Edit song</Button>
        {isSongWriter && <Button variant="secondary" onClick={deleteSong}>Delete song</Button>}
        {latest && <Link to={`/stage/song/${song.id}`}><Button type="button">▶ Stage view</Button></Link>}
        <Link to={`/app/messages?song=${song.id}`}>💬 Discuss</Link>
      </div>
      {actionError && <span className="error-text">{actionError}</span>}

      <div className="row" role="tablist">
        <Button role="tab" aria-selected={view === 'tab'} variant={view === 'tab' ? 'primary' : 'secondary'} onClick={() => setView('tab')}>Tab</Button>
        <Button role="tab" aria-selected={view === 'versions'} variant={view === 'versions' ? 'primary' : 'secondary'} onClick={() => setView('versions')}>
          Versions ({song.versions.length})
        </Button>
      </div>

      {view === 'versions' ? (
        <section className="stack">
          {song.versions.length === 0 && <p className="muted">No tab versions yet.</p>}
          {song.versions.map((v) => (
            <div key={v.id} className="row between">
              <span>
                Version {v.versionNumber} <span className="muted">• {formatDate(v.createdAt)} • {v.createdByName ?? 'unknown'}</span>
                {v.id === latest?.id && <> <StatusBadge kind="final" /></>}
              </span>
              <Button variant="secondary" onClick={() => viewVersion(v.id)}>View</Button>
            </div>
          ))}
          <Button onClick={() => setMode('newVersion')}>Upload new version</Button>
        </section>
      ) : tab ? (
        <section className="stack">
          {!isLatest && (
            <p className="muted">
              Viewing version {tab.versionNumber}. <button className="link-button" onClick={() => setViewedTab(null)}>Back to latest</button>
            </p>
          )}
          <div className="grid">
            <div><div className="muted">Key</div>{show(tab.key)}</div>
            <div><div className="muted">Tempo</div>{tab.tempo ? `${tab.tempo} BPM` : '—'}</div>
            <div><div className="muted">Capo</div>{show(tab.capo)}</div>
            <div><div className="muted">Tuning</div>{show(tab.tuning)}</div>
          </div>
          {tab.sourceType !== 'original' && (
            <p className="muted">
              Cover{tab.sourceUrl && <> — <a href={tab.sourceUrl} target="_blank" rel="noreferrer">Ultimate Guitar</a></>}
            </p>
          )}
          <ChordSheet sections={tab.displayFormat?.sections} />
          {isLatest && <Button variant="secondary" onClick={() => setMode('editTab')}>Edit chords & details</Button>}
        </section>
      ) : (
        <section className="stack">
          <p className="muted">No tab yet.</p>
          <Button onClick={() => setMode('newVersion')}>Add tab</Button>
        </section>
      )}

      <section>
        <h3>Lyrics</h3>
        {!isSongWriter && <p className="muted">🔒 Edit by song writer only</p>}
        {song.lyrics ? <p style={{ whiteSpace: 'pre-wrap' }}>{song.lyrics}</p> : <p className="muted">No lyrics added.</p>}
      </section>
    </div>
  );
}
