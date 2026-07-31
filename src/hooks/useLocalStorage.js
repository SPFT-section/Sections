import { useState, useEffect, useCallback } from 'react';
import { STORAGE_ERROR_EVENT } from '../config/constants';

const notifyStorageError = (key, error) => {
  if (typeof window === 'undefined' || !window.dispatchEvent) return;
  window.dispatchEvent(
    new CustomEvent(STORAGE_ERROR_EVENT, {
      detail: { key, message: error?.message || String(error) },
    })
  );
};

export const useLocalStorage = (key, initialValue) => {
  const resolveInitial = () =>
    typeof initialValue === 'function' ? initialValue() : initialValue;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : resolveInitial();
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return resolveInitial();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
      // Without this, a failed write (e.g. quota exceeded) looked identical
      // to a successful save from the user's point of view — React state
      // had already updated, so the UI showed the change, but nothing was
      // actually persisted and it was gone on the next reload.
      notifyStorageError(key, error);
    }
  }, [key, storedValue]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(resolveInitial());
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setStoredValue, remove];
};
