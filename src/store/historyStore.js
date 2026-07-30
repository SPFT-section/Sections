import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const initialHistory = [];

const HistoryContext = createContext(null);

// Shared via context (see NovelProvider for rationale). Functions are
// memoized with useCallback so effects that depend on them (e.g. the
// reading-progress tracker in NovelReader) don't re-fire on every render.
const useHistoryState = () => {
  const [history, setHistory] = useLocalStorage('stq-history', initialHistory);

  const addHistory = useCallback((novelId, chapterId, progress = 0, scrollPosition = 0) => {
    setHistory((prev) => {
      const existing = prev.find(
        (item) => item.novelId === novelId && item.chapterId === chapterId
      );

      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, lastRead: Date.now(), progress, scrollPosition }
            : item
        );
      }

      const newHistory = {
        id: uuidv4(),
        novelId,
        chapterId,
        lastRead: Date.now(),
        progress,
        scrollPosition,
      };
      return [newHistory, ...prev];
    });
  }, [setHistory]);

  const getHistory = useCallback((novelId) => {
    return history.filter((item) => item.novelId === novelId);
  }, [history]);

  const getLatestHistory = useCallback(() => {
    // Copy before sorting - never mutate state arrays in place.
    return [...history].sort((a, b) => b.lastRead - a.lastRead);
  }, [history]);

  const getLastRead = useCallback((novelId) => {
    const novelHistory = getHistory(novelId);
    return novelHistory.length > 0
      ? [...novelHistory].sort((a, b) => b.lastRead - a.lastRead)[0]
      : null;
  }, [getHistory]);

  const clearHistory = useCallback(() => {
    if (window.confirm('Clear all reading history?')) {
      setHistory([]);
      return true;
    }
    return false;
  }, [setHistory]);

  const removeHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, [setHistory]);

  const clearNovelHistory = useCallback((novelId) => {
    setHistory((prev) => prev.filter((item) => item.novelId !== novelId));
  }, [setHistory]);

  return {
    history,
    addHistory,
    getHistory,
    getLatestHistory,
    getLastRead,
    clearHistory,
    removeHistory,
    clearNovelHistory,
  };
};

export const HistoryProvider = ({ children }) => {
  const value = useHistoryState();
  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistoryStore = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error('useHistoryStore must be used within a <HistoryProvider>');
  }
  return ctx;
};

export default useHistoryStore;
