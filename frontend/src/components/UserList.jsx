export default function UserList({ users }) {
  if (users.length === 0) return <p>No users found.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Username</th>
          <th>Email</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{/* TODO: Edit / Delete buttons */}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
