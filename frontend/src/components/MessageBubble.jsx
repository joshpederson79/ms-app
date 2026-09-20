import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { formatMessageTime, initials } from '../utils/formatMessage.js';
import { formatDate } from '../utils/formatGig.js';
import styles from './MessageBubble.module.css';

// One chat bubble. `threadLink` (timeline only) adds the Reply / "N replies" link to the thread screen.
export default function MessageBubble({ message, isOwn, canDelete, onDelete, threadLink = false }) {
  const { senderName, createdAt, content, songId, songName, gigId, gigVenue, gigDate, replyCount, isResolved, id } = message;

  return (
    <div className={`${styles.wrap} ${isOwn ? styles.own : ''} ${isResolved ? styles.resolved : ''}`}>
      <span className={styles.avatar} aria-hidden="true">{initials(senderName)}</span>
      <div className={styles.bubble}>
        <div className={styles.meta}>
          {isOwn ? 'You' : senderName} • {formatMessageTime(createdAt)} {isResolved && <StatusBadge kind="resolved" />}
        </div>
        <div className={styles.content}>{content}</div>

        {(songId || gigId) && (
          <div className={styles.chips}>
            {songId && <Link to={`/app/songs/${songId}`}>🎵 {songName}</Link>}
            {gigId && <Link to={`/app/gigs/${gigId}`}>🎪 {gigVenue}{gigDate && `, ${formatDate(gigDate)}`}</Link>}
          </div>
        )}

        {(threadLink || canDelete) && (
          <div className={styles.footer}>
            {threadLink && (
              <Link to={`/app/messages/${id}`}>{replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}</Link>
            )}
            {canDelete && <button type="button" onClick={() => onDelete(message)}>Delete</button>}
          </div>
        )}
      </div>
    </div>
  );
}
