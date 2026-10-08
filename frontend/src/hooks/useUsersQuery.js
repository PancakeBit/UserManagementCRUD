import { useCallback, useEffect, useState } from 'react';
import { listUsers, PAGE_SIZE } from '../api/usersApi.js';

// Fetches one page of users for a search term, and refetches whenever q or page changes.
// `result` keeps the last successful page while a new one loads, so the table doesn't
// collapse and jump on every keystroke.
export function useUsersQuery({ q, page, limit = PAGE_SIZE }) {
  const [result, setResult] = useState(null); // { data, page, limit, total, totalPages }
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // Abort the previous request when q/page change, so a slow old response
    // can never overwrite a newer one.
    const controller = new AbortController();
    setStatus('loading');

    listUsers({ q, page, limit, signal: controller.signal })
      .then((data) => {
        setResult(data);
        setError(null);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err);
        setStatus('error');
      });

    return () => controller.abort();
  }, [q, page, limit, reloadCount]);

  // Re-runs the effect with the same q/page, e.g. after a create, update or delete.
  const refetch = useCallback(() => setReloadCount((n) => n + 1), []);

  return { result, status, error, refetch };
}
