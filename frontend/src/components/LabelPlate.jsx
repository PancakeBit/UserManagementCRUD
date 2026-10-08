import SearchBar from './SearchBar.jsx';
import Button from './Button.jsx';

// The header, set like the label-plate holder on a catalogue drawer front:
// title and live card count engraved on the plate, search and "new" beneath it.
export default function LabelPlate({ total, search, onSearchChange, onNewUser }) {
  return (
    <header className="label-plate rounded-sm bg-surface px-4 py-5 sm:px-6">
      <div className="flex items-baseline justify-between gap-4 border-b border-ink/30 pb-3">
        <h1 className="font-display text-2xl uppercase tracking-[0.2em]">Users</h1>
        <p className="font-display text-sm" aria-live="polite">
          {total === null ? '…' : `${total} ${total === 1 ? 'card' : 'cards'}`}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={onSearchChange} />
        <Button variant="primary" onClick={onNewUser}>
          + New user
        </Button>
      </div>
    </header>
  );
}
