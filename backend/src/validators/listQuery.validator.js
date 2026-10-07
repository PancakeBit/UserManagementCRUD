import { HttpError } from '../utils/HttpError.js';

export const TEXT_FIELDS = ['name', 'username', 'email'];
const ALLOWED_PARAMS = ['q', 'id', 'page', 'limit', ...TEXT_FIELDS];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Parses GET /api/users query params.
// Absent params get defaults; present-but-invalid params are reported, never corrected.
// All problems are collected and thrown together as one 400 with { param: message } details.
export function parseListQuery(query) {
  const errors = {};

  for (const key of Object.keys(query)) {
    if (!ALLOWED_PARAMS.includes(key)) errors[key] = 'unknown query parameter';
  }

  // Trimmed string, or undefined when absent/invalid (invalid also records an error).
  function readString(key) {
    const value = query[key];
    if (value === undefined) return undefined;
    if (typeof value !== 'string') {
      errors[key] = 'must be given at most once';
      return undefined;
    }
    const trimmed = value.trim();
    if (trimmed === '') {
      errors[key] = 'must not be empty';
      return undefined;
    }
    return trimmed;
  }

  function readPositiveInt(key, max) {
    const raw = readString(key);
    if (raw === undefined) return undefined;
    if (!/^[1-9]\d*$/.test(raw)) {
      errors[key] = 'must be a positive integer';
      return undefined;
    }
    const n = Number(raw);
    if (max !== undefined && n > max) {
      errors[key] = `must be at most ${max}`;
      return undefined;
    }
    return n;
  }

  const page = readPositiveInt('page') ?? DEFAULT_PAGE;
  const limit = readPositiveInt('limit', MAX_LIMIT) ?? DEFAULT_LIMIT;
  const id = readPositiveInt('id');
  const q = readString('q')?.toLowerCase();
  const fieldFilters = TEXT_FIELDS
    .map((field) => [field, readString(field)?.toLowerCase()])
    .filter(([, term]) => term !== undefined);

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Invalid query parameters', errors);
  }

  return { page, limit, id, q, fieldFilters };
}
