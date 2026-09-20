import { useEffect } from 'react';

// Scrolls the page down at a steady pixels-per-second rate while `playing`.
// Fractions of a pixel are carried between frames so slow speeds still move smoothly.
export function useAutoScroll(playing, pxPerSecond) {
  useEffect(() => {
    if (!playing) return undefined;
    let frame;
    let last = performance.now();
    let carry = 0;

    const tick = (now) => {
      carry += ((now - last) / 1000) * pxPerSecond;
      last = now;
      const whole = Math.floor(carry);
      if (whole > 0) {
        window.scrollBy(0, whole);
        carry -= whole;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, pxPerSecond]);
}
