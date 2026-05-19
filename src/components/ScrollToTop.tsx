import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls page to top on route change.
 * Does NOT scroll on query-only changes (e.g. ?tab=x).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Sequential resets to overpower animation quirks
    const timers = [30, 80, 180, 350].map(delay =>
      setTimeout(() => {
        window.scrollTo(0, 0);
        const scrollContainers = document.querySelectorAll('.overflow-y-auto');
        scrollContainers.forEach(container => {
          container.scrollTop = 0;
        });
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return null;
}
