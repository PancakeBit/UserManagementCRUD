import { useEffect, useRef } from 'react';

// Wraps the native <dialog>, which already traps focus, closes on Esc, and returns
// focus to the button that opened it. This only syncs it with React's `open` prop.
// Children mount only while open, so a form starts fresh every time.
export default function Modal({ open, onClose, titleId, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Esc: let React decide whether to close (the parent may be mid-save).
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="card-pull m-auto w-[calc(100%-2rem)] max-w-md rounded-sm bg-surface p-0 text-ink backdrop:bg-ink/50"
    >
      {open && <div className="p-6">{children}</div>}
    </dialog>
  );
}
