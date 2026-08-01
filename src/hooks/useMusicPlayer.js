import { useEffect, useRef, useState, useCallback } from 'react';
import { getAudioObjectUrl } from '../utils/audioStorage';

// Drives background-music playback for the reader: watches which paragraph
// index is currently in view (via IntersectionObserver on elements the
// caller marks with data-paragraph-index — see ReadingView) and starts/
// stops/crossfades the music cue whose [startParagraph, endParagraph]
// range covers that paragraph.
//
// Kept as its own hook (rather than folded into NovelReader) so the
// scroll-driven cue logic, audio element lifecycle, and fade timers are
// all in one place and easy to reason about independently of the page's
// navigation/progress-bar logic.
export const useMusicPlayer = ({ containerRef, cues, enabled = true }) => {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const currentCueIdRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [activeCueId, setActiveCueId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Lazily create a single reusable <audio> element for the whole reader
  // session, instead of one per cue, so playback state (and the user's
  // mute choice) survives switching between cues.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeTo = useCallback((targetVolume, durationMs, onDone) => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    const steps = Math.max(Math.round(durationMs / 50), 1);
    const startVolume = audio.volume;
    const delta = (targetVolume - startVolume) / steps;
    let step = 0;
    fadeIntervalRef.current = setInterval(() => {
      step += 1;
      const next = startVolume + delta * step;
      audio.volume = Math.min(Math.max(next, 0), 1);
      if (step >= steps) {
        clearFade();
        audio.volume = Math.min(Math.max(targetVolume, 0), 1);
        if (onDone) onDone();
      }
    }, 50);
  }, []);

  const stopCurrent = useCallback((fadeMs = 1000) => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;
    fadeTo(0, fadeMs, () => {
      audio.pause();
      setIsPlaying(false);
    });
  }, [fadeTo]);

  const playCue = useCallback(async (cue) => {
    const audio = audioRef.current;
    if (!audio || !cue) return;

    currentCueIdRef.current = cue.id;
    setActiveCueId(cue.id);

    let src = cue.url;
    if (cue.source === 'upload' && cue.audioId) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      src = await getAudioObjectUrl(cue.audioId);
      objectUrlRef.current = src;
    }
    if (!src) return;

    // The scroll listener may have moved on to a different (or no) cue
    // while we were awaiting the IndexedDB read above.
    if (currentCueIdRef.current !== cue.id) return;

    audio.src = src;
    audio.loop = cue.loop !== false;
    audio.volume = 0;
    audio.muted = isMuted;
    try {
      await audio.play();
      setIsPlaying(true);
      fadeTo(cue.volume ?? 0.6, cue.fadeMs ?? 1500);
    } catch {
      // Autoplay can be blocked until the user interacts with the page;
      // playback will retry the next time a scroll event picks a cue.
      setIsPlaying(false);
    }
  }, [fadeTo, isMuted]);

  // Recompute which cue (if any) covers the given paragraph index and
  // switch playback if it differs from what's currently playing.
  const handleParagraphChange = useCallback((paragraphIndex) => {
    if (!enabled) return;
    const match = cues.find(
      (c) => paragraphIndex >= c.startParagraph && paragraphIndex <= c.endParagraph
    );

    if (!match) {
      if (currentCueIdRef.current !== null) {
        currentCueIdRef.current = null;
        setActiveCueId(null);
        stopCurrent();
      }
      return;
    }

    if (match.id === currentCueIdRef.current) return;

    // Crossfade: fade the old track down, then start the new one.
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      fadeTo(0, match.fadeMs ?? 1500, () => {
        audio.pause();
        playCue(match);
      });
    } else {
      playCue(match);
    }
  }, [cues, enabled, fadeTo, playCue, stopCurrent]);

  // Observe every paragraph element in the reading container and report
  // whichever one is most prominently in view.
  useEffect(() => {
    // A chapter switch changes `cues` wholesale (it's derived from
    // currentChapter.musicCues by the caller) — any cue id carried over
    // from the previous chapter is stale, so drop it before deciding
    // whether there's anything left to observe. Without this, switching
    // into a chapter with no cues of its own would leave the previous
    // chapter's track playing forever, since there'd be no paragraph
    // element left to trigger handleParagraphChange(null-match).
    if (cues.length === 0) {
      if (currentCueIdRef.current !== null) {
        currentCueIdRef.current = null;
        setActiveCueId(null);
        stopCurrent();
      }
      return undefined;
    }

    const container = containerRef?.current;
    if (!container || !enabled) return undefined;

    const paragraphEls = container.querySelectorAll('[data-paragraph-index]');
    if (paragraphEls.length === 0) return undefined;

    let latestVisible = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-paragraph-index'));
            latestVisible = idx;
          }
        });
        if (latestVisible !== null) {
          handleParagraphChange(latestVisible);
        }
      },
      { root: container, threshold: 0.5 }
    );

    paragraphEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, cues, enabled]);

  // Stop everything when leaving the chapter/unmounting, or when disabled.
  useEffect(() => {
    if (!enabled) {
      stopCurrent(300);
    }
  }, [enabled, stopCurrent]);

  useEffect(() => () => {
    clearFade();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  return {
    activeCueId,
    isPlaying,
    isMuted,
    toggleMute,
  };
};

export default useMusicPlayer;
