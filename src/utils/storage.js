// Storage utility functions with error handling

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
      return false;
    }
  },

  getAll: () => {
    try {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = JSON.parse(localStorage.getItem(key));
      }
      return items;
    } catch (error) {
      console.warn('Error getting all localStorage items:', error);
      return {};
    }
  },

  // Check if storage is available
  isAvailable: () => {
    try {
      const test = 'storage-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Get storage usage
  getUsage: () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      total += key.length + (value ? value.length : 0);
    }
    return total;
  },
};

// NOTE: an IndexedDB helper used to live here, but nothing in the app ever
// called it — novels, chapters, and everything else are stored through
// `storage` (localStorage) above via useLocalStorage. It was removed as
// dead code rather than left in place implying a capability the app
// doesn't actually have. Moving large content (chapters, cover images) to
// IndexedDB remains a real option for lifting the ~5-10MB localStorage
// quota ceiling, it just isn't implemented yet.
