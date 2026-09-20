import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api.js';

export function useSong(id) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSong((await api.get(`/songs/${id}`)).data);
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

  return { song, loading, error, reload: load };
}
