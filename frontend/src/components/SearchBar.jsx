export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="search"
      placeholder="Search by name, username or email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
