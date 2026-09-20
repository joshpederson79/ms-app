import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../utils/api.js';
import { usePolling } from './usePolling.js';

// Thread roots for the Messages timeline (oldest first). Polls for new ones and pages back via loadEarlier.
// `filters` is { song?, gig? }; changing them reloads from scratch.
export function useMessages(filters = {}) {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filterKey = JSON.stringify(filters);
  const params = useRef(filters);
  params.current = filters;
  // Only the first fetch decides whether older pages exist; later polls must not re-enable "load earlier".
  const initialised = useRef(false);

  // Replace the newest window with fresh data but keep older pages already loaded,
  // so polling picks up new, deleted and resolved messages without losing scroll history.
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/messages', { params: params.current });
      const oldest = data.messages[0]?.id ?? Infinity;
      setMessages((prev) => [...prev.filter((m) => m.id < oldest), ...data.messages]);
      if (!initialised.current) {
        initialised.current = true;
        setHasMore(data.hasMore);
      }
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialised.current = false;
    setMessages([]);
    setHasMore(false);
    setLoading(true);
    refresh();
  }, [filterKey, refresh]);

  usePolling(refresh);

  const loadEarlier = async () => {
    if (messages.length === 0) return;
    const { data } = await api.get('/messages', { params: { ...params.current, before: messages[0].id } });
    setMessages((prev) => [...data.messages, ...prev]);
    setHasMore(data.hasMore);
  };

  const remove = (id) => setMessages((prev) => prev.filter((m) => m.id !== id));

  return { messages, hasMore, loading, error, refresh, loadEarlier, remove };
}
