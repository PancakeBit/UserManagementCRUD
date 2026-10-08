import { useCallback, useEffect, useState } from 'react';
import { listUsers, PAGE_SIZE } from '../api/usersApi.js';

// Fetches one page of users for a set of filters, and refetches whenever filters, page or limit change.
// `result` keeps the last successful page while a new one loads, so the table doesn't
// collapse and jump on every keystroke.
export function useUsersQuery({ filters, page, limit = PAGE_SIZE }) {
  const [result, setResult] = useState(null); // { data, page, limit, total, totalPages }
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Compared by content, not by reference: a new object with the same filters must not refetch.
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    // Abort the previous request when filters/page/limit change, so a slow old response
    // can never overwrite a newer one.
    const controller = new AbortController();
    setStatus('loading');

    listUsers({ filters: JSON.parse(filtersKey), page, limit, signal: controller.signal })
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
  }, [filtersKey, page, limit, reloadCount]);

  // Re-runs the effect with the same filters/page/limit, e.g. after a create, update or delete.
  const refetch = useCallback(() => setReloadCount((n) => n + 1), []);

  return { result, status, error, refetch };
}
