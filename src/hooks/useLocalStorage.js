import { useState, useEffect, useCallback } from 'react';

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
