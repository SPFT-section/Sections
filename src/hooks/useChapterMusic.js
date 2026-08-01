import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNovel } from './useNovel';
import { deleteAudioFile } from '../utils/audioStorage';

// A music cue describes one background-music moment within a chapter:
//   { id, source: 'upload' | 'url', audioId? (IndexedDB ref), url?,
//     label, startParagraph, endParagraph, volume }
// startParagraph/endParagraph are indices into splitIntoParagraphs(content),
// inclusive — the same indices ReadingView already assigns to each <p> via
// data-paragraph-index, so no separate content-parsing step is needed and
// edits to the chapter text don't silently break existing cues (only
// re-numbering paragraphs would, and that's inherent to an index-based
// scheme regardless of storage format).
//
// Cues are stored on the chapter itself (chapter.musicCues), alongside
// title/content, so they ride the existing novel/chapter localStorage
// persistence for free. Only `audioId` (a small string key into IndexedDB)
// is stored for uploads — never the audio bytes.

export const useChapterMusic = (novelId, chapterId) => {
  const { getChapter, updateChapter } = useNovel();

  const getCues = useCallback(() => {
    const chapter = getChapter(novelId, chapterId);
    return chapter?.musicCues || [];
  }, [getChapter, novelId, chapterId]);

  const saveCues = useCallback((cues) => {
    updateChapter(novelId, chapterId, { musicCues: cues });
  }, [updateChapter, novelId, chapterId]);

  const addCue = useCallback((cueData) => {
    const newCue = {
      id: uuidv4(),
      source: cueData.source, // 'upload' | 'url'
      audioId: cueData.audioId || null,
      url: cueData.url || '',
      label: cueData.label || 'เพลงประกอบ',
      startParagraph: cueData.startParagraph ?? 0,
      endParagraph: cueData.endParagraph ?? cueData.startParagraph ?? 0,
      volume: cueData.volume ?? 0.6,
      loop: cueData.loop ?? true,
      fadeMs: cueData.fadeMs ?? 1500,
    };
    const cues = [...getCues(), newCue];
    saveCues(cues);
    return newCue;
  }, [getCues, saveCues]);

  const updateCue = useCallback((cueId, data) => {
    const cues = getCues().map((cue) => (cue.id === cueId ? { ...cue, ...data } : cue));
    saveCues(cues);
  }, [getCues, saveCues]);

  const removeCue = useCallback(async (cueId) => {
    const cue = getCues().find((c) => c.id === cueId);
    const cues = getCues().filter((c) => c.id !== cueId);
    saveCues(cues);
    // Clean up the orphaned audio blob so IndexedDB doesn't accumulate
    // files for cues the user has deleted.
    if (cue?.source === 'upload' && cue.audioId) {
      try {
        await deleteAudioFile(cue.audioId);
      } catch {
        // Non-fatal — worst case an unused blob lingers in IndexedDB.
      }
    }
  }, [getCues, saveCues]);

  return {
    cues: getCues(),
    addCue,
    updateCue,
    removeCue,
  };
};

export default useChapterMusic;
