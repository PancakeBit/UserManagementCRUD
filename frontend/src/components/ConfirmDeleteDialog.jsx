import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

// Asks before deleting. onConfirm returns a promise; the buttons stay disabled until it settles.
export default function ConfirmDeleteDialog({ user, onCancel, onConfirm }) {
  return (
    <Modal open={Boolean(user)} onClose={onCancel} titleId="confirm-delete-title">
      <ConfirmDelete user={user} onCancel={onCancel} onConfirm={onConfirm} />
    </Modal>
  );
}

function ConfirmDelete({ user, onCancel, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <h2 id="confirm-delete-title" className="text-lg font-medium">
        Delete {user.name}?
      </h2>
      <p className="mt-2 text-sm">
        <span className="font-display">@{user.username}</span> will be removed from the list.
      </p>
      <div className="mt-8 flex justify-end gap-2">
        <Button onClick={onCancel} disabled={deleting} autoFocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </>
  );
}
