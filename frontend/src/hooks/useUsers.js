import { useEffect, useState } from 'react';
import * as api from '../api/usersApi.js';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // TODO: add create/update/remove that call the api then update `users` state

  return { users, loading, error };
}
