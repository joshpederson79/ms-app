import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import MessageBubble from '../components/MessageBubble.jsx';
import MessageComposer from '../components/MessageComposer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useThread } from '../hooks/useThread.js';
import api from '../utils/api.js';
import { errorMessage } from '../utils/songPayload.js';

export default function MessageThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { thread, loading, error, refresh } = useThread(id);
  const [actionError, setActionError] = useState('');

  if (loading && !thread) return <p className="muted">Loading…</p>;
  if (error || !thread) {
    return <p className="error-text">{error?.response?.status === 404 ? 'This thread no longer exists.' : 'Could not load this thread.'}</p>;
  }

  const canDelete = (m) => m.senderId === user.id || user.isAdmin;

  const act = async (request, fallback) => {
    setActionError('');
    try {
      await request();
      return true;
    } catch (err) {
      setActionError(errorMessage(err, fallback));
      return false;
    }
  };

  const toggleResolved = async () => {
    if (await act(() => api.patch(`/messages/${thread.id}`, { is_resolved: !thread.isResolved }), 'Could not update the thread.')) refresh();
  };

  const deleteMessage = async (message) => {
    const isRoot = message.id === thread.id;
    if (!window.confirm(isRoot ? 'Delete this thread and all its replies?' : 'Delete this reply?')) return;
    if (await act(() => api.delete(`/messages/${message.id}`), 'Could not delete that message.')) {
      if (isRoot) navigate('/app/messages');
      else refresh();
    }
  };

  return (
    <div className="stack">
      <Link to="/app/messages" className="muted">← Messages</Link>

      <MessageBubble message={thread} isOwn={thread.senderId === user.id} canDelete={canDelete(thread)} onDelete={deleteMessage} />
      <div className="row">
        <Button variant="secondary" onClick={toggleResolved}>{thread.isResolved ? 'Reopen thread' : 'Mark resolved'}</Button>
      </div>
      {actionError && <span className="error-text">{actionError}</span>}

      <h3>{thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}</h3>
      {thread.replies.map((reply) => (
        <MessageBubble key={reply.id} message={reply} isOwn={reply.senderId === user.id} canDelete={canDelete(reply)} onDelete={deleteMessage} />
      ))}

      <MessageComposer threadId={thread.id} onSent={refresh} />
    </div>
  );
}
