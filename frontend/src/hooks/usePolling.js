import { useEffect, useRef } from 'react';

// Calls `callback` every `ms` while the tab is visible, and once more when it becomes visible again,
// so a backgrounded tab doesn't hammer the API but catches up on return.
export function usePolling(callback, ms = 10000) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') saved.current();
    };
    const timer = setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ms]);
}
