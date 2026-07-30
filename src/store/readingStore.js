import { useReadingSettings } from '../hooks/useReadingSettings';

// Re-export useReadingSettings as useReadingStore for consistent naming
export const useReadingStore = useReadingSettings;

export default useReadingStore;
