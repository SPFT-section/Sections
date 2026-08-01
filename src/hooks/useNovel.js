import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { sortByField } from '../utils/sortHelpers';

const initialNovels = [];

const NovelContext = createContext(null);

// The actual state + logic lives here, instantiated ONCE by <NovelProvider>.
// Previously every component called this logic independently via its own
// useState/useLocalStorage, so edits made on one page (e.g. NovelEditor)
// were invisible to another mounted instance (e.g. a persistent header/stat
// widget) until a full remount re-read localStorage. Centralizing it in
// context means every consumer reads and writes the same shared state.
const useNovelState = () => {
  const [novels, setNovels] = useLocalStorage('stq-novels', initialNovels);
  const [currentNovel, setCurrentNovel] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);

  // Create a new novel
  const createNovel = useCallback((data) => {
    const newNovel = {
      id: uuidv4(),
      title: data.title || 'Untitled',
      author: data.author || 'Anonymous',
      synopsis: data.synopsis || '',
      coverImage: data.coverImage || '',
      genre: data.genre || [],
      status: data.status || 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chapters: [],
    };

    setNovels((prev) => [...prev, newNovel]);
    return newNovel;
  }, [setNovels]);

  // Update a novel
  const updateNovel = useCallback((id, data) => {
    setNovels((prev) =>
      prev.map((novel) => {
        if (novel.id !== id) return novel;
        // Defense in depth: shared (read-only) novels must never be
        // mutated, even if something bypasses the UI (e.g. a direct
        // /editor/:id navigation). The UI is also expected to hide all
        // edit affordances for these, but this guard is the real backstop.
        if (novel.isShared) return novel;
        return {
          ...novel,
          ...data,
          updatedAt: Date.now(),
        };
      })
    );
  }, [setNovels]);

  // Delete a novel
  const deleteNovel = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this novel?')) {
      setNovels((prev) => prev.filter((novel) => novel.id !== id));
      if (currentNovel?.id === id) {
        setCurrentNovel(null);
        setCurrentChapter(null);
      }
      return true;
    }
    return false;
  }, [setNovels, currentNovel]);

  // Get a novel by ID
  const getNovel = useCallback((id) => {
    return novels.find((novel) => novel.id === id);
  }, [novels]);

  // Add a chapter to a novel
  const addChapter = useCallback((novelId, data) => {
    const novel = getNovel(novelId);
    if (!novel) return null;

    const newChapter = {
      id: uuidv4(),
      title: data.title || 'Untitled Chapter',
      content: data.content || '',
      order: novel.chapters.length + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    updateNovel(novelId, {
      chapters: [...novel.chapters, newChapter],
      updatedAt: Date.now(),
    });

    return newChapter;
  }, [getNovel, updateNovel]);

  // Update a chapter
  const updateChapter = useCallback((novelId, chapterId, data) => {
    const novel = getNovel(novelId);
    if (!novel) return null;

    const updatedChapters = novel.chapters.map((chapter) =>
      chapter.id === chapterId
        ? {
            ...chapter,
            ...data,
            updatedAt: Date.now(),
          }
        : chapter
    );

    updateNovel(novelId, {
      chapters: updatedChapters,
      updatedAt: Date.now(),
    });
  }, [getNovel, updateNovel]);

  // Delete a chapter
  const deleteChapter = useCallback((novelId, chapterId) => {
    const novel = getNovel(novelId);
    if (!novel) return false;

    if (window.confirm('Are you sure you want to delete this chapter?')) {
      const updatedChapters = novel.chapters
        .filter((chapter) => chapter.id !== chapterId)
        .map((chapter, index) => ({
          ...chapter,
          order: index + 1,
        }));

      updateNovel(novelId, {
        chapters: updatedChapters,
        updatedAt: Date.now(),
      });

      if (currentChapter?.id === chapterId) {
        setCurrentChapter(null);
      }
      return true;
    }
    return false;
  }, [getNovel, updateNovel, currentChapter]);

  // Get chapters of a novel
  const getChapters = useCallback((novelId) => {
    const novel = getNovel(novelId);
    return novel?.chapters || [];
  }, [getNovel]);

  // Get a chapter by ID
  const getChapter = useCallback((novelId, chapterId) => {
    const novel = getNovel(novelId);
    return novel?.chapters.find((chapter) => chapter.id === chapterId) || null;
  }, [getNovel]);

  // Get novel stats
  const getNovelStats = useCallback((novelId) => {
    const novel = getNovel(novelId);
    if (!novel) return null;

    const totalChapters = novel.chapters.length;
    const totalWords = novel.chapters.reduce(
      (sum, chapter) => sum + (chapter.content?.split(/\s+/).filter(Boolean).length || 0),
      0
    );

    return {
      totalChapters,
      totalWords,
      status: novel.status,
      updatedAt: novel.updatedAt,
    };
  }, [getNovel]);

  // Get all novels with sorting
  const getAllNovels = useCallback((sortBy = 'updatedAt', order = 'desc') => {
    return sortByField(novels, sortBy, order);
  }, [novels]);

  // Import a novel received via a share link. Always creates a read-only,
  // local copy — the recipient can read it but the UI (see Library/Editor)
  // must never expose edit/write actions for novels with isShared: true.
  // Returns the existing local copy instead of duplicating it if this
  // exact shared novel (by sourceId) was already imported before.
  const importSharedNovel = useCallback((sharePayload) => {
    const { sourceId, sharedBy, novel: sharedNovel } = sharePayload;

    const existing = novels.find(
      (n) => n.isShared && n.sourceId === sourceId
    );
    if (existing) return existing;

    const newNovel = {
      id: uuidv4(),
      title: sharedNovel.title || 'Untitled',
      author: sharedNovel.author || 'Anonymous',
      synopsis: sharedNovel.synopsis || '',
      coverImage: sharedNovel.coverImage || '',
      genre: sharedNovel.genre || [],
      status: 'published',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chapters: (sharedNovel.chapters || []).map((c, index) => ({
        id: uuidv4(),
        title: c.title || 'Untitled Chapter',
        content: c.content || '',
        order: c.order || index + 1,
        // Share links only ever carry URL-sourced cues (see
        // utils/shareLink.js buildPayload) — never 'upload' cues, whose
        // audio lives only in the sharer's local IndexedDB.
        musicCues: c.musicCues || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })),
      isShared: true,
      sharedBy: sharedBy || sharedNovel.author || 'Anonymous',
      sourceId,
      importedAt: Date.now(),
    };

    setNovels((prev) => [...prev, newNovel]);
    return newNovel;
  }, [novels, setNovels]);

  return {
    novels,
    currentNovel,
    currentChapter,
    setCurrentNovel,
    setCurrentChapter,
    createNovel,
    updateNovel,
    deleteNovel,
    getNovel,
    addChapter,
    updateChapter,
    deleteChapter,
    getChapters,
    getChapter,
    getNovelStats,
    getAllNovels,
    importSharedNovel,
  };
};

export const NovelProvider = ({ children }) => {
  const value = useNovelState();
  return <NovelContext.Provider value={value}>{children}</NovelContext.Provider>;
};

export const useNovel = () => {
  const ctx = useContext(NovelContext);
  if (!ctx) {
    throw new Error('useNovel must be used within a <NovelProvider>');
  }
  return ctx;
};
