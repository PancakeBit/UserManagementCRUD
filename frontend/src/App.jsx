import { useState } from 'react';
import { useUsers } from './hooks/useUsers.js';
import SearchBar from './components/SearchBar.jsx';
import UserList from './components/UserList.jsx';
import UserForm from './components/UserForm.jsx';

export default function App() {
  const { users, loading, error } = useUsers();
  const [query, setQuery] = useState('');

  // TODO: filter users by name/username/email using `query`
  const visibleUsers = users;

  return (
    <main>
      <h1>User Management</h1>
      <SearchBar value={query} onChange={setQuery} />
      <UserForm />
      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && <UserList users={visibleUsers} />}
    </main>
  );
}
