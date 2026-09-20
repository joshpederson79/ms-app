import { useEffect, useState } from 'react';
import Button from './Button.jsx';
import Select from './Select.jsx';
import Textarea from './Textarea.jsx';
import api from '../utils/api.js';
import { formatDate } from '../utils/formatGig.js';
import { errorMessage } from '../utils/songPayload.js';
import styles from './MessageComposer.module.css';

// Sends a new thread (with an optional song/gig tag) or, when `threadId` is set, a reply.
// onSent receives the created message.
export default function MessageComposer({ threadId, defaultTag = '', onSent }) {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState(defaultTag); // 'song:ID' | 'gig:ID' | ''
  const [songs, setSongs] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const canTag = !threadId;

  useEffect(() => setTag(defaultTag), [defaultTag]);

  useEffect(() => {
    if (!canTag) return;
    api.get('/songs').then(({ data }) => setSongs(data)).catch(() => {});
    api.get('/gigs').then(({ data }) => setGigs(data)).catch(() => {});
  }, [canTag]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    setError('');
    const body = { content: content.trim() };
    if (threadId) body.thread_id = threadId;
    else if (tag) body[tag.startsWith('song:') ? 'song_id' : 'gig_id'] = Number(tag.split(':')[1]);
    try {
      const { data } = await api.post('/messages', body);
      setContent('');
      onSent(data);
    } catch (err) {
      setError(errorMessage(err, 'Could not send your message.'));
    } finally {
      setSending(false);
    }
  };

  // Enter sends; Shift+Enter adds a new line.
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  return (
    <form className={styles.composer} onSubmit={submit}>
      {canTag && (
        <details className={styles.tag} open={Boolean(defaultTag)}>
          <summary>Tag a song or gig (optional)</summary>
          <Select aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">No tag</option>
            <optgroup label="Songs">
              {songs.map((s) => <option key={s.id} value={`song:${s.id}`}>{s.name}</option>)}
            </optgroup>
            <optgroup label="Gigs">
              {gigs.map((g) => <option key={g.id} value={`gig:${g.id}`}>{g.venue}, {formatDate(g.date)}</option>)}
            </optgroup>
          </Select>
        </details>
      )}
      <div className={styles.send}>
        <Textarea
          aria-label={threadId ? 'Reply' : 'Message'}
          placeholder={threadId ? 'Write a reply…' : 'Message the band…'}
          rows={2}
          value={content}
          maxLength={5000}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button type="submit" disabled={sending || !content.trim()}>Send</Button>
      </div>
      {error && <span className="error-text">{error}</span>}
    </form>
  );
}
