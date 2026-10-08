import UserRow from './UserRow.jsx';
import Button from './Button.jsx';
import { PAGE_SIZE } from '../api/usersApi.js';

const COLUMNS = 5;

// Shows exactly one of: skeleton (first load), error, empty, or the rows.
// On later loads the previous rows stay visible, dimmed, until the new page arrives.
export default function UserTable({ users, status, error, query, onRetry, onClearSearch, onEdit, onDelete }) {
  const firstLoad = users === null && status === 'loading';
  const refreshing = users !== null && status === 'loading';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" aria-busy={status === 'loading'}>
        <thead>
          <tr className="font-display text-sm uppercase tracking-wide">
            <th scope="col" className="w-16 py-3 pr-4 pl-4 font-normal sm:pl-6">No.</th>
            <th scope="col" className="py-3 pr-4 font-normal">Name</th>
            <th scope="col" className="hidden py-3 pr-4 font-normal sm:table-cell">Username</th>
            <th scope="col" className="hidden py-3 pr-4 font-normal sm:table-cell">Email</th>
            <th scope="col" className="py-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className={`transition-opacity ${refreshing ? 'opacity-50' : ''}`}>
          {status === 'error' ? (
            <MessageRow>
              <p role="alert" className="text-accent2">{error.message}</p>
              <Button variant="primary" onClick={onRetry} className="mt-4">
                Retry
              </Button>
            </MessageRow>
          ) : firstLoad ? (
            <SkeletonRows />
          ) : users.length === 0 ? (
            <MessageRow>
              {query ? (
                <>
                  <p>No cards filed under “{query}”.</p>
                  <Button onClick={onClearSearch} className="mt-4 text-accent">
                    Clear search
                  </Button>
                </>
              ) : (
                <p>The drawer is empty. Add the first user.</p>
              )}
            </MessageRow>
          ) : (
            users.map((user) => <UserRow key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

function MessageRow({ children }) {
  return (
    <tr className="border-t border-ink/15">
      <td colSpan={COLUMNS} className="px-6 py-12 text-center">
        {children}
      </td>
    </tr>
  );
}

// Placeholder rows the same height as real ones, so nothing shifts when data arrives.
function SkeletonRows() {
  return Array.from({ length: PAGE_SIZE }, (_, i) => (
    <tr key={i} className="border-t border-ink/15" aria-hidden="true">
      <td colSpan={COLUMNS} className="px-4 py-3 sm:px-6">
        <div className="h-6 rounded-sm bg-ink/10" />
      </td>
    </tr>
  ));
}
