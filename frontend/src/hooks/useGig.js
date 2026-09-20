import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api.js';

export function useGig(id) {
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setGig((await api.get(`/gigs/${id}`)).data);
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

  return { gig, loading, error, reload: load };
}
