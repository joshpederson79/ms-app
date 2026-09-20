import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api.js';

export function useSetlist(id) {
  const [setlist, setSetlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setSetlist((await api.get(`/setlists/${id}`)).data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { setlist, loading, error, reload: load };
}
