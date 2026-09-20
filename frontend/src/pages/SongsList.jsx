import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useSongs } from '../hooks/useSongs.js';
import { useUsers } from '../hooks/useUsers.js';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Final', value: 'Final' },
  { label: 'WIP', value: 'WIP' },
];

export default function SongsList() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [singer, setSinger] = useState('');
  const { data: users } = useUsers();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: songs, loading, error } = useSongs({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(status && { status }),
    ...(singer && { singer }),
  });

  const filtered = Boolean(debouncedSearch || status || singer);

  return (
    <div className="stack">
      <div className="row between">
        <h2 style={{ marginBottom: 0 }}>Songs</h2>
        <Link to="/app/upload"><Button type="button">+ Upload</Button></Link>
      </div>

      <Input aria-label="Search songs" placeholder="Search songs" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="row">
        {STATUS_FILTERS.map((f) => (
          <Button key={f.label} type="button" variant={status === f.value ? 'primary' : 'secondary'} onClick={() => setStatus(f.value)}>
            {f.label}
          </Button>
        ))}
        <Select aria-label="Lead singer" value={singer} onChange={(e) => setSinger(e.target.value)}>
          <option value="">All lead singers</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
      </div>

      {error && <p className="error-text">Could not load songs.</p>}
      {!error && !loading && songs.length === 0 && (
        <p className="muted">
          {filtered ? 'No songs match those filters.' : 'No songs yet. Upload the first one.'}
        </p>
      )}

      {songs.map((song) => (
        <Card key={song.id} as={Link} to={`/app/songs/${song.id}`} interactive>
          <strong>{song.name}</strong>
          <div className="muted">
            Lead: {song.leadSingerName}
            {song.isDuet && ` & ${song.secondSingerName}`} •{' '}
            <StatusBadge kind={song.status === 'Final' ? 'final' : 'wip'} />
            {song.isDuet && <> <StatusBadge kind="duet" /></>}
          </div>
          <div className="muted">{song.versionCount} {song.versionCount === 1 ? 'version' : 'versions'}</div>
        </Card>
      ))}
    </div>
  );
}
