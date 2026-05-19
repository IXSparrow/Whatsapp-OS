import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook to read/write URL search params as state.
 * Usage: const [value, setValue] = useQueryState('tab', 'overview');
 */
export function useQueryState(key: string, defaultValue: string = '') {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback((newValue: string) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (newValue === defaultValue || newValue === '') {
        updated.delete(key);
      } else {
        updated.set(key, newValue);
      }
      return updated;
    }, { replace: true });
  }, [key, defaultValue, setSearchParams]);

  return [value, setValue] as const;
}
