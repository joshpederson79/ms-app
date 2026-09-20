import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import MessageBubble from '../components/MessageBubble.jsx';
import MessageComposer from '../components/MessageComposer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useMessages } from '../hooks/useMessages.js';
import api from '../utils/api.js';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const song = searchParams.get('song');
  const gig = searchParams.get('gig');
  const filters = { ...(song && { song }), ...(gig && { gig }) };
  const { messages, hasMore, loading, error, refresh, loadEarlier, remove } = useMessages(filters);

  // Jump to the newest message on first load and after sending; polling never yanks the scroll position.
  const bottomRef = useRef(null);
  const [scrollNext, setScrollNext] = useState(true);
  useEffect(() => {
    if (scrollNext && !loading) {
      bottomRef.current?.scrollIntoView();
      setScrollNext(false);
    }
  }, [scrollNext, loading, messages]);

  const deleteMessage = async (message) => {
    if (!window.confirm('Delete this message and its replies?')) return;
    try {
      await api.delete(`/messages/${message.id}`);
      remove(message.id);
    } catch {
      refresh();
    }
  };

  const defaultTag = song ? `song:${song}` : gig ? `gig:${gig}` : '';

  return (
    <div className="stack">
      <h2 style={{ marginBottom: 0 }}>Messages</h2>

      {(song || gig) && (
        <p className="muted">
          Showing messages about this {song ? 'song' : 'gig'}. <Link to="/app/messages">Show all</Link>
        </p>
      )}

      {hasMore && <Button variant="secondary" onClick={loadEarlier}>Load earlier messages</Button>}
      {error && <p className="error-text">Could not load messages.</p>}
      {!error && !loading && messages.length === 0 && (
        <p className="muted">{song || gig ? 'No messages about this yet.' : 'No messages yet. Start the conversation.'}</p>
      )}

      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === user.id}
          canDelete={message.senderId === user.id || user.isAdmin}
          onDelete={deleteMessage}
          threadLink
        />
      ))}
      <div ref={bottomRef} />

      <MessageComposer
        defaultTag={defaultTag}
        onSent={async () => {
          await refresh(); // scroll only once the new message is in the list
          setScrollNext(true);
        }}
      />
    </div>
  );
}
