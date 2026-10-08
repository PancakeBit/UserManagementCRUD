// One user in the table. Buttons name the user in their aria-label, so a screen reader
// hears "Edit Sofia Taylor" rather than ten identical "Edit" buttons.
// `busy` is true while this user is being loaded for a dialog; its buttons ignore clicks until then.
// They use aria-disabled, not disabled: a disabled button drops keyboard focus, and the dialog
// that opens next would then have nowhere to return focus to when it closes.
export default function UserRow({ user, busy, onView, onEdit, onDelete }) {
  return (
    <tr className="group border-t border-ink/15 hover:bg-ink/5" aria-busy={busy}>
      <td className="py-3 pr-4 pl-4 font-display text-sm opacity-70 sm:pl-6">
        {String(user.id).padStart(3, '0')}
      </td>
      <td className="py-3 pr-4">
        <button
          type="button"
          onClick={() => !busy && onView(user)}
          aria-disabled={busy}
          aria-haspopup="dialog"
          className="rounded-sm text-left font-medium underline-offset-4 hover:text-accent hover:underline aria-disabled:cursor-wait"
        >
          {user.name}
        </button>
        {/* Phones: username and email fold under the name instead of taking their own columns. */}
        <span className="block text-sm wrap-anywhere sm:hidden">
          @{user.username}
          <br />
          {user.email}
        </span>
      </td>
      <td className="hidden py-3 pr-4 sm:table-cell">{user.username}</td>
      <td className="hidden py-3 pr-4 wrap-anywhere sm:table-cell">{user.email}</td>
      <td className="py-3 pr-4 text-right whitespace-nowrap sm:pr-6">
        <RowAction label={`Edit ${user.name}`} onClick={() => onEdit(user)} disabled={busy}>
          Edit
        </RowAction>
        <RowAction label={`Delete ${user.name}`} onClick={() => onDelete(user)} disabled={busy} danger>
          Delete
        </RowAction>
      </td>
    </tr>
  );
}

// Always visible (touch screens have no hover), full contrast; underlined on hover.
function RowAction({ label, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => !disabled && onClick()}
      aria-disabled={disabled}
      className={`ml-1 rounded-sm px-2 py-1 text-sm hover:underline aria-disabled:cursor-wait aria-disabled:opacity-50 ${
        danger ? 'text-accent2' : 'text-accent'
      }`}
    >
      {children}
    </button>
  );
}
