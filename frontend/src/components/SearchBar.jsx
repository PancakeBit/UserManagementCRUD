export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <label htmlFor="user-search" className="sr-only">
        Search users
      </label>
      <input
        id="user-search"
        type="search"
        placeholder="Search by name, username or email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        className="w-full rounded-sm border border-ink/30 bg-surface px-3 py-2 outline-none placeholder:text-ink/60 focus:border-accent"
      />
    </div>
  );
}
