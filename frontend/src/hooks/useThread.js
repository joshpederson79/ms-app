import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api.js';
import { usePolling } from './usePolling.js';

export function useThread(id) {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setThread((await api.get(`/messages/${id}`)).data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  usePolling(refresh);

  return { thread, loading, error, refresh };
}
