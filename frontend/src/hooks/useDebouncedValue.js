import { useEffect, useState } from 'react';

// Returns `value` once it has stopped changing for `delay` ms.
// Used so typing in the search box sends one request, not one per keystroke.
export function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
