import { useState } from 'react';
import { createUser, deleteUser, updateUser } from './api/usersApi.js';
import { useDebouncedValue } from './hooks/useDebouncedValue.js';
import { useUsersQuery } from './hooks/useUsersQuery.js';
import { useToast } from './hooks/useToasts.jsx';
import LabelPlate from './components/LabelPlate.jsx';
import UserTable from './components/UserTable.jsx';
import Pagination from './components/Pagination.jsx';
import UserFormDialog from './components/UserFormDialog.jsx';
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog.jsx';

const SEARCH_DELAY_MS = 300;

// Owns the page's state (search, page, which dialog is open) and the CRUD handlers.
// Components below only receive data and callbacks; only api/usersApi.js talks to the server.
export default function App() {
  const showToast = useToast();

  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);

  // The page number belongs to one search term. When the term changes, the stored page no
  // longer matches it and we fall back to page 1, without an extra request for the old term.
  const [pageState, setPageState] = useState({ q: '', page: 1 });
  const page = pageState.q === q ? pageState.page : 1;
  const setPage = (newPage) => setPageState({ q, page: newPage });

  const { result, status, error, refetch } = useUsersQuery({ q, page });

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <LabelPlate
        total={result?.total ?? null}
        search={search}
        onSearchChange={setSearch}
        onNewUser={openCreate}
      />

      <section aria-label="User list" className="mt-6 rounded-sm bg-surface">
        <UserTable
          users={result?.data ?? null}
          status={status}
          error={error}
          query={q}
          onRetry={handleRetry}
          onClearSearch={() => setSearch('')}
          onEdit={openEdit}
          onDelete={setDeletingUser}
        />
        {result && status !== 'error' && (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            limit={result.limit}
            onPageChange={setPage}
          />
        )}
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
