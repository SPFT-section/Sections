import { useEffect } from 'react';

// Lightweight, front-end deterrent against casually copying novel text:
// blocks the copy/cut events, right-click menu, text selection, and the
// most common copy/print keyboard shortcuts *within a given container*.
//
// Honest limitation: this is a UX deterrent, not real DRM. Anyone using
// the browser's dev tools (or reading the page source) can still get the
// text — no client-side JS can fully prevent that. It stops casual
// copy-paste and right-click "Select All", which covers the aesthetic
// and light anti-piracy goal this was added for.
export const useContentProtection = (containerRef, enabled = true) => {
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled) return undefined;

    const blockEvent = (e) => {
      e.preventDefault();
      return false;
    };

    const blockShortcuts = (e) => {
      const key = e.key?.toLowerCase();
      const isCopyLike = (e.ctrlKey || e.metaKey) && ['c', 'x', 'p', 's', 'u'].includes(key);
      if (isCopyLike) {
        e.preventDefault();
      }
    };

    node.addEventListener('copy', blockEvent);
    node.addEventListener('cut', blockEvent);
    node.addEventListener('contextmenu', blockEvent);
    node.addEventListener('dragstart', blockEvent);
    node.addEventListener('keydown', blockShortcuts);

    return () => {
      node.removeEventListener('copy', blockEvent);
      node.removeEventListener('cut', blockEvent);
      node.removeEventListener('contextmenu', blockEvent);
      node.removeEventListener('dragstart', blockEvent);
      node.removeEventListener('keydown', blockShortcuts);
    };
  }, [containerRef, enabled]);
};

export default useContentProtection;
