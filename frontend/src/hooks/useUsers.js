import { useEffect, useState } from 'react';
import api from '../utils/api.js';

export function useUsers() {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get('/users').then(({ data: rows }) => setData(rows)).catch(() => {});
  }, []);
  return { data };
}
