import { useId, useState } from 'react';

// Narrow the list by one field each. All filled fields must match (AND), on top of the main search.
const FIELDS = [
  { key: 'id', label: 'No.', numeric: true },
  { key: 'name', label: 'Name' },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
];

// Folded away by default so the label plate stays quiet. The toggle shows how many
// filters are set, so a filtered list is never a mystery while the panel is closed.
export default function FieldFilters({ values, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const activeCount = FIELDS.filter(({ key }) => values[key].trim()).length;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-4 text-sm font-medium">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="rounded-sm py-1 hover:underline"
        >
          {open ? '▾' : '▸'} Filter by field
          {activeCount > 0 && <span className="font-display"> · {activeCount}</span>}
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="rounded-sm py-1 text-accent hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {open && (
        <div id={panelId} className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-[6rem_repeat(3,minmax(0,1fr))]">
          {FIELDS.map((field) => (
            <FilterInput key={field.key} field={field} value={values[field.key]} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterInput({ field, value, onChange }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-display text-sm uppercase tracking-wide">
        {field.label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        // The API only accepts a positive whole number for id, so keep anything else out.
        onChange={(event) =>
          onChange(field.key, field.numeric ? event.target.value.replace(/\D/g, '') : event.target.value)
        }
        inputMode={field.numeric ? 'numeric' : undefined}
        maxLength={field.numeric ? 9 : undefined}
        autoComplete="off"
        className={`mt-1 w-full rounded-sm border border-ink/30 bg-surface px-3 py-2 outline-none focus:border-accent ${
          field.numeric ? 'font-display' : ''
        }`}
      />
    </div>
  );
}
