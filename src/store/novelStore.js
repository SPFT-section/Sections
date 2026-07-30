import { useNovel } from '../hooks/useNovel';

// Re-export useNovel as useNovelStore for consistent naming across the app
export const useNovelStore = useNovel;

export default useNovelStore;
