import { useId } from 'react';
import { PAGE_SIZES } from '../api/usersApi.js';

// Which page numbers to show: always the first and last, the current page and its
// neighbours, and '…' where pages are skipped. 15 pages, on 7 → 1 … 6 7 8 … 15
export function pageWindow(current, totalPages) {
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - current) <= 1) {
      if (pages.length > 0 && p - pages[pages.length - 1] > 1) pages.push('…');
      pages.push(p);
    }
  }
  return pages;
}

// `limit` is the page size the shown page was fetched with; `pageSize` is the one chosen in
// the select. They differ only while a new page size is loading.
// Rendered above and below the table; `position` sets which edge gets the rule and the nav's name.
export default function Pagination({ position, page, totalPages, total, limit, onPageChange, pageSize, onPageSizeChange }) {
  const sizeId = useId();
  if (total === 0) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label={position === 'top' ? 'Pagination, top' : 'Pagination, bottom'}
      className={`flex flex-col items-center justify-between gap-3 border-ink/15 px-4 py-4 text-sm sm:flex-row sm:px-6 ${
        position === 'top' ? 'border-b' : 'border-t'
      }`}
    >
      <div className="flex items-center gap-4">
        <p>
          Showing <span className="font-display">{first}–{last}</span> of{' '}
          <span className="font-display">{total}</span>
        </p>
        <p className="flex items-center gap-2">
          <label htmlFor={sizeId}>Per page</label>
          <select
            id={sizeId}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-sm border border-ink/30 bg-surface px-2 py-1 font-display outline-none focus:border-accent"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </p>
      </div>

      {totalPages > 1 && (
        <ol className="flex items-center gap-1 font-display">
          <li>
            <PageButton onClick={() => onPageChange(page - 1)} disabled={page === 1} label="Previous page">
              ‹ Prev
            </PageButton>
          </li>
          {pageWindow(page, totalPages).map((p, i) =>
            p === '…' ? (
              <li key={`gap-${i}`} aria-hidden="true" className="px-1 opacity-60">…</li>
            ) : (
              <li key={p}>
                <PageButton
                  onClick={() => onPageChange(p)}
                  current={p === page}
                  label={`Page ${p}`}
                >
                  {p}
                </PageButton>
              </li>
            ),
          )}
          <li>
            <PageButton onClick={() => onPageChange(page + 1)} disabled={page === totalPages} label="Next page">
              Next ›
            </PageButton>
          </li>
        </ol>
      )}
    </nav>
  );
}

function PageButton({ onClick, disabled, current, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || current}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      className={`min-w-9 rounded-sm px-2 py-1 ${
        current ? 'bg-accent text-surface' : 'hover:bg-ink/10 disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  );
}
