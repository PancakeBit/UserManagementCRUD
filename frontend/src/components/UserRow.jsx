// One user in the table. Buttons name the user in their aria-label, so a screen reader
// hears "Edit Sofia Taylor" rather than ten identical "Edit" buttons.
export default function UserRow({ user, onEdit, onDelete }) {
  return (
    <tr className="group border-t border-ink/15 hover:bg-ink/5">
      <td className="py-3 pr-4 pl-4 font-display text-sm opacity-70 sm:pl-6">
        {String(user.id).padStart(3, '0')}
      </td>
      <td className="py-3 pr-4">
        <span className="font-medium">{user.name}</span>
        {/* Phones: username and email fold under the name instead of taking their own columns. */}
        <span className="block text-sm [overflow-wrap:anywhere] sm:hidden">
          @{user.username}
          <br />
          {user.email}
        </span>
      </td>
      <td className="hidden py-3 pr-4 sm:table-cell">{user.username}</td>
      <td className="hidden py-3 pr-4 [overflow-wrap:anywhere] sm:table-cell">{user.email}</td>
      <td className="py-3 pr-4 text-right whitespace-nowrap sm:pr-6">
        <RowAction label={`Edit ${user.name}`} onClick={() => onEdit(user)}>
          Edit
        </RowAction>
        <RowAction label={`Delete ${user.name}`} onClick={() => onDelete(user)} danger>
          Delete
        </RowAction>
      </td>
    </tr>
  );
}

// Always visible (touch screens have no hover), full contrast; underlined on hover.
function RowAction({ label, onClick, danger, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`ml-1 rounded-sm px-2 py-1 text-sm hover:underline ${
        danger ? 'text-accent2' : 'text-accent'
      }`}
    >
      {children}
    </button>
  );
}
