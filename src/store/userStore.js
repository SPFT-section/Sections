import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext(null);

// Shared via context (see NovelProvider for rationale) so profile edits made
// on one page are immediately visible everywhere else.
const useUserState = () => {
  const [profile, setProfile] = useLocalStorage('stq-user-profile', () => ({
    id: uuidv4(),
    displayName: 'User',
    avatar: '',
    joinedAt: Date.now(),
  }));

  const updateProfile = useCallback((data) => {
    setProfile((prev) => ({
      ...prev,
      ...data,
      updatedAt: Date.now(),
    }));
  }, [setProfile]);

  const getStats = useCallback((novels) => {
    const totalNovels = novels?.length || 0;
    const totalChapters = novels?.reduce(
      (sum, novel) => sum + (novel.chapters?.length || 0),
      0
    );
    const totalWords = novels?.reduce(
      (sum, novel) =>
        sum +
        (novel.chapters?.reduce(
          (s, chapter) =>
            s + (chapter.content?.split(/\s+/).filter(Boolean).length || 0),
          0
        ) || 0),
      0
    );

    return {
      totalNovels,
      totalChapters,
      totalWords,
    };
  }, []);

  return {
    profile,
    updateProfile,
    getStats,
  };
};

export const UserProvider = ({ children }) => {
  const value = useUserState();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserStore = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserStore must be used within a <UserProvider>');
  }
  return ctx;
};

export default useUserStore;
