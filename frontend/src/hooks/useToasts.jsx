import { createContext, useCallback, useContext, useRef, useState } from 'react';

const DISMISS_AFTER_MS = 4000;
const ToastContext = createContext(null);

// Holds the toast list and renders it, so any component can call useToast() without
// prop drilling. The region is aria-live, so screen readers announce each message.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  // tone: 'success' | 'error'
  const showToast = useCallback(
    (message, tone = 'success') => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, message, tone }]);
      setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        aria-live="polite"
        className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`flex max-w-sm items-start gap-4 rounded-sm px-4 py-3 text-sm text-surface ${
              toast.tone === 'error' ? 'bg-accent2' : 'bg-ink'
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="font-display leading-none opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Returns showToast(message, tone).
export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error('useToast must be used inside <ToastProvider>');
  return showToast;
}
