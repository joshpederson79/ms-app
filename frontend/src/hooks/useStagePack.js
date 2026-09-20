import { useEffect, useState } from 'react';
import { getPack, savePack } from '../utils/offline.js';
import { fetchPack } from '../utils/stagePack.js';

// With a saved offline copy we only wait a few seconds for the server (a sleeping Render instance takes
// 30-50s, and venues have weak signal), then fall back to the copy. Without one, we wait for the network.
const SAVED_COPY_TIMEOUT_MS = 4000;

export function useStagePack(kind, id) {
  const [state, setState] = useState({ pack: null, loading: true, error: null, savedAt: null });

  useEffect(() => {
    let cancelled = false;
    const saved = kind === 'song' ? null : getPack(kind, id);

    (async () => {
      try {
        const pack = await fetchPack(kind, id, saved ? SAVED_COPY_TIMEOUT_MS : 0);
        if (saved) {
          try {
            savePack(kind, id, pack); // keep a saved copy fresh whenever we're online
          } catch {
            /* storage full: the live copy still works */
          }
        }
        if (!cancelled) setState({ pack, loading: false, error: null, savedAt: null });
      } catch (error) {
        if (cancelled) return;
        // Use the saved copy for any failure except "it was deleted".
        if (saved && error.response?.status !== 404) {
          setState({ pack: saved.pack, loading: false, error: null, savedAt: saved.savedAt });
        } else {
          setState({ pack: null, loading: false, error, savedAt: null });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  return state;
}
