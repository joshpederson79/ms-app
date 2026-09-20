import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from './Button.jsx';
import Input from './Input.jsx';
import StatusBadge from './StatusBadge.jsx';
import api from '../utils/api.js';
import { errorMessage } from '../utils/songPayload.js';
import styles from './Setlist.module.css';

const singers = (item) => `${item.leadSingerName}${item.isDuet ? ` & ${item.secondSingerName}` : ''}`;

function SetlistRow({ item, index, canManage, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !canManage,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <li ref={setNodeRef} style={style} className={styles.row}>
      {canManage && (
        <button type="button" className={styles.handle} aria-label={`Reorder ${item.songName}`} {...attributes} {...listeners}>
          ⋮
        </button>
      )}
      <span className={styles.position}>{index + 1}</span>
      <div className={styles.song}>
        <Link to={`/app/songs/${item.songId}`}>{item.songName}</Link>
        <div className="muted">
          {singers(item)}
          {item.status !== 'Final' && <> • <StatusBadge kind="wip" /></>}
        </div>
      </div>
      {canManage && (
        <Button type="button" variant="secondary" aria-label={`Remove ${item.songName}`} onClick={() => onRemove(item)}>
          Remove
        </Button>
      )}
    </li>
  );
}

// Final songs not already in the setlist, searchable.
function SongPicker({ existingSongIds, onPick }) {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get('/songs', { params: { status: 'Final' } }).then(({ data }) => setSongs(data)).catch(() => setFailed(true));
  }, []);

  const needle = search.trim().toLowerCase();
  const available = songs.filter((s) => !existingSongIds.has(s.id) && s.name.toLowerCase().includes(needle));

  return (
    <div className="stack">
      <Input aria-label="Search Final songs" placeholder="Search Final songs" value={search} onChange={(e) => setSearch(e.target.value)} />
      {failed && <p className="error-text">Could not load songs.</p>}
      {!failed && available.length === 0 && <p className="muted">No Final songs to add.</p>}
      <div className={styles.picker}>
        {available.map((song) => (
          <div key={song.id} className="row between">
            <span>
              {song.name} <span className="muted">• {song.leadSingerName}</span>
            </span>
            <Button type="button" variant="secondary" onClick={() => onPick(song)}>Add</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Setlist with drag-and-drop reordering for gig leads, read-only for everyone else.
export default function Setlist({ gigId, items: serverItems, canManage, onChanged }) {
  const [items, setItems] = useState(serverItems);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // Server data is the source of truth; local state only exists for instant drag feedback.
  useEffect(() => setItems(serverItems), [serverItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const run = async (action, fallback) => {
    setError('');
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err, fallback));
    }
    onChanged();
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    setItems(arrayMove(items, from, to));
    run(() => api.patch(`/gigs/${gigId}/setlist/${active.id}`, { position: to + 1 }), 'Could not reorder the setlist.');
  };

  const addSong = (song) => run(() => api.post(`/gigs/${gigId}/setlist`, { song_id: song.id }), 'Could not add that song.');
  const removeItem = (item) => run(() => api.delete(`/gigs/${gigId}/setlist/${item.id}`), 'Could not remove that song.');

  return (
    <section className="stack">
      <div className="row between">
        <h3 style={{ marginBottom: 0 }}>Setlist ({items.length} {items.length === 1 ? 'song' : 'songs'})</h3>
        {canManage && (
          <Button type="button" variant="secondary" onClick={() => setAdding((v) => !v)}>
            {adding ? 'Done' : '+ Add song'}
          </Button>
        )}
      </div>

      {error && <span className="error-text">{error}</span>}
      {canManage && adding && <SongPicker existingSongIds={new Set(items.map((i) => i.songId))} onPick={addSong} />}

      {items.length === 0 ? (
        <p className="muted">Setlist pending.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ol className={styles.list}>
              {items.map((item, index) => (
                <SetlistRow key={item.id} item={item} index={index} canManage={canManage} onRemove={removeItem} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
