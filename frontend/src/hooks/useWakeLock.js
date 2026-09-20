import { useEffect } from 'react';

// Keeps the screen on while `enabled`. Browsers release the lock when the tab is hidden, so re-acquire on return.
export const wakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

export function useWakeLock(enabled) {
  useEffect(() => {
    if (!enabled || !wakeLockSupported) return undefined;
    let sentinel = null;
    let stopped = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (stopped) lock.release().catch(() => {});
        else sentinel = lock;
      } catch {
        /* denied (e.g. low battery); nothing to do */
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && acquire();

    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [enabled]);
}
