import { HttpError } from '../utils/HttpError.js';

// Digits only, no leading zero: rejects "0", "-1", "1.5", "1e2", "0x10", " 1".
const POSITIVE_INT = /^[1-9]\d*$/;

// Also rejects numbers too big for JS to represent exactly: "9007199254740993" would
// silently become 9007199254740992 and look up a different id.
export function isPositiveIntString(value) {
  return typeof value === 'string' && POSITIVE_INT.test(value) && Number.isSafeInteger(Number(value));
}

// For /api/users/:id. Route params are always strings.
export function parseIdParam(raw) {
  if (!isPositiveIntString(raw)) {
    throw new HttpError(400, 'Invalid route parameter', { id: 'must be a positive integer' });
  }
  return Number(raw);
}
