import { useState } from 'react';
import { createUser, deleteUser, updateUser, PAGE_SIZE } from './api/usersApi.js';
import { useDebouncedValue } from './hooks/useDebouncedValue.js';
import { useUsersQuery } from './hooks/useUsersQuery.js';
import { useToast } from './hooks/useToasts.jsx';
import LabelPlate from './components/LabelPlate.jsx';
import UserTable from './components/UserTable.jsx';
import Pagination from './components/Pagination.jsx';
import UserFormDialog from './components/UserFormDialog.jsx';
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog.jsx';

const SEARCH_DELAY_MS = 300;

// q searches every text field; the rest each filter one field. All given filters must match.
const EMPTY_SEARCH = { q: '', id: '', name: '', username: '', email: '' };

// Typed values → what the API gets: trimmed, and an id only once it is a real positive number.
function toFilters(search) {
  const filters = {};
  for (const [field, value] of Object.entries(search)) filters[field] = value.trim();
  const id = Number(filters.id); // the input only accepts digits: "007" → 7, "0" or "" → no filter
  filters.id = id >= 1 ? String(id) : '';
  return filters;
}

// Owns the page's state (search, page, which dialog is open) and the CRUD handlers.
// Components below only receive data and callbacks; only api/usersApi.js talks to the server.
export default function App() {
  const showToast = useToast();

  // What's typed in the search box and the field filters, as typed.
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const filters = toFilters(useDebouncedValue(search, SEARCH_DELAY_MS));
  const setSearchField = (field, value) => setSearch((prev) => ({ ...prev, [field]: value }));

  const [limit, setLimit] = useState(PAGE_SIZE);

  // The page number belongs to one set of filters and one page size. When either changes we go
  // back to page 1 during this render, so no request is sent for the old page. The old page is
  // overwritten, not kept, so clearing a search never lands back on the page you left.
  const queryKey = JSON.stringify({ filters, limit });
  const [pageState, setPageState] = useState({ queryKey, page: 1 });
  if (pageState.queryKey !== queryKey) setPageState({ queryKey, page: 1 });
  const page = pageState.queryKey === queryKey ? pageState.page : 1;
  const setPage = (newPage) => setPageState({ queryKey, page: newPage });

  const { result, status, error, refetch } = useUsersQuery({ filters, page, limit });

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null while the form creates
  const [deletingUser, setDeletingUser] = useState(null);

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setFormOpen(true);
  }

  // Errors not handled here are re-thrown so the form can show them on its fields.
  async function handleSave(values) {
    try {
      const saved = editingUser ? await updateUser(editingUser.id, values) : await createUser(values);
      showToast(editingUser ? `${saved.name} updated` : `${saved.name} added as No. ${saved.id}`);
      setFormOpen(false);
      refetch();
    } catch (err) {
      if (err.status !== 404) throw err;
      // Someone else deleted this user while the form was open.
      showToast(`${editingUser.name} no longer exists`, 'error');
      setFormOpen(false);
      refetch();
    }
  }

  async function handleConfirmDelete() {
    const user = deletingUser;
    let removed = true;
    try {
      await deleteUser(user.id);
      showToast(`${user.name} deleted`);
    } catch (err) {
      removed = err.status === 404; // already gone counts as removed
      showToast(removed ? `${user.name} was already deleted` : err.message, 'error');
    }
    setDeletingUser(null);
    if (!removed) return;

    // Removing the only row on the last page would leave us past the end (the API answers 400), so step back.
    if (result.data.length === 1 && page > 1) setPage(page - 1);
    else refetch();
  }

  // A 400 about `page` means the list shrank under us (e.g. deletes in another tab): restart at page 1.
  function handleRetry() {
    if (error?.details?.page) setPage(1);
    else refetch();
  }

  // The same pager above and below the table, so a 100-row page needs no scrolling to turn.
  const pager = (position) =>
    result && status !== 'error' && (
      <Pagination
        position={position}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        limit={result.limit}
        onPageChange={setPage}
        pageSize={limit}
        onPageSizeChange={setLimit}
      />
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <LabelPlate
        total={result?.total ?? null}
        search={search}
        onSearchChange={setSearchField}
        onClearFilters={() => setSearch((prev) => ({ ...EMPTY_SEARCH, q: prev.q }))}
        onNewUser={openCreate}
      />

      <section aria-label="User list" className="mt-6 rounded-sm bg-surface">
        {pager('top')}
        <UserTable
          users={result?.data ?? null}
          status={status}
          error={error}
          filters={filters}
          skeletonRows={limit}
          onRetry={handleRetry}
          onClearSearch={() => setSearch(EMPTY_SEARCH)}
          onEdit={openEdit}
          onDelete={setDeletingUser}
        />
        {pager('bottom')}
      </section>

      <UserFormDialog
        open={formOpen}
        user={editingUser}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmDeleteDialog
        user={deletingUser}
        onCancel={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
