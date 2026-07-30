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

// IndexedDB helper for larger data
export const indexedDBStorage = {
  open: (dbName, version = 1) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('novels')) {
          db.createObjectStore('novels', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  save: (dbName, storeName, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await indexedDBStorage.open(dbName);
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  },

  get: (dbName, storeName, id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await indexedDBStorage.open(dbName);
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  },

  getAll: (dbName, storeName) => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await indexedDBStorage.open(dbName);
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  },

  delete: (dbName, storeName, id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await indexedDBStorage.open(dbName);
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  },
};
