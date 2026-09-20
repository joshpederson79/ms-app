import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import { listPacks } from '../utils/offline.js';

// Shortcuts to stage view for anything saved on this device; usable even when the lists can't load.
export default function OfflinePacks({ kind }) {
  const packs = listPacks(kind);
  if (packs.length === 0) return null;

  return (
    <section className="stack">
      <h3>Saved for offline</h3>
      {packs.map((pack) => (
        <Card key={pack.id} as={Link} to={`/stage/${kind}/${pack.id}/1`} interactive>
          <strong>▶ {pack.title}</strong>
          <div className="muted">{pack.count} {pack.count === 1 ? 'song' : 'songs'} • stage view</div>
        </Card>
      ))}
    </section>
  );
}
