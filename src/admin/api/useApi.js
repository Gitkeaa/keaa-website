import { useCallback, useEffect, useState } from 'react';
import { api } from './client';

/**
 * GET a path and expose { data, loading, error, reload }. Used by the table screens so
 * they all share the same loading / error handling instead of repeating it.
 */
export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.get(path));
    } catch (e) {
      setError(e.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}
