import Modal from './Modal.jsx';
import Button from './Button.jsx';

// Read-only view of one user, opened by clicking a name. `user` is the copy just loaded
// with GET /api/users/:id, so it shows what is saved now, not what the list showed.
export default function UserDetailsDialog({ user, onClose, onEdit, onDelete }) {
  return (
    <Modal open={Boolean(user)} onClose={onClose} titleId="user-details-title">
      <UserDetails user={user} onClose={onClose} onEdit={onEdit} onDelete={onDelete} />
    </Modal>
  );
}

function UserDetails({ user, onClose, onEdit, onDelete }) {
  return (
    <>
      <p className="font-display text-sm opacity-70">No. {String(user.id).padStart(3, '0')}</p>
      <h2 id="user-details-title" className="mt-1 text-xl font-medium">
        {user.name}
      </h2>

      <dl className="mt-6 space-y-4">
        <Detail label="Username">@{user.username}</Detail>
        <Detail label="Email">{user.email}</Detail>
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button variant="quietDanger" onClick={() => onDelete(user)}>
          Delete
        </Button>
        <div className="ml-auto flex gap-2">
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => onEdit(user)} autoFocus>
            Edit
          </Button>
        </div>
      </div>
    </>
  );
}

function Detail({ label, children }) {
  return (
    <div className="border-b border-ink/15 pb-2">
      <dt className="font-display text-sm uppercase tracking-wide opacity-70">{label}</dt>
      <dd className="mt-1 wrap-anywhere">{children}</dd>
    </div>
  );
}
