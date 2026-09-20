import { useEffect, useState } from 'react';
import api from '../utils/api.js';

// Fetches /gigs on mount. Filters (e.g. search/status) get added as params when the screen needs them.
export function useGigs(params) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/gigs', { params })
      .then(({ data: rows }) => !cancelled && setData(rows))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(params)]);

  return { data, loading, error };
}
