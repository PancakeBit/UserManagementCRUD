import { HttpError } from '../utils/HttpError.js';
import { USER_FIELDS, UNIQUE_FIELDS, SERVER_FIELDS, isActive } from '../models/user.js';

// Validates a POST/PUT body. Returns a clean user object (outer spaces removed, `lowercase` fields lowercased)
// or throws one 400 listing every problem as { field: message }.
export function parseUserBody(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  // No prototype: with a plain {}, errors['__proto__'] = '...' sets the prototype
  // instead of adding a key, so a '__proto__' param/field would slip through unreported.
  const errors = Object.create(null);
  const user = {};

  for (const key of Object.keys(body)) {
    if (SERVER_FIELDS.includes(key)) errors[key] = 'is set by the server and cannot be sent';
    else if (!Object.hasOwn(USER_FIELDS, key)) errors[key] = 'unknown field';
  }

  for (const [field, rules] of Object.entries(USER_FIELDS)) {
    const value = body[field];

    if (value === undefined) {
      errors[field] = 'is required';
      continue;
    }
    if (typeof value !== 'string') {
      errors[field] = 'must be a string';
      continue;
    }

    const withoutOuterSpaces = value.trim();
    if (withoutOuterSpaces === '') errors[field] = 'must not be empty';
    else if (rules.minLength && withoutOuterSpaces.length < rules.minLength) errors[field] = `must be at least ${rules.minLength} characters`;
    else if (withoutOuterSpaces.length > rules.maxLength) errors[field] = `must be at most ${rules.maxLength} characters`;
    else if (rules.pattern && !rules.pattern.test(withoutOuterSpaces)) errors[field] = rules.patternMessage;
    else user[field] = rules.lowercase ? withoutOuterSpaces.toLowerCase() : withoutOuterSpaces;
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Invalid user data', errors);
  }

  return user;
}

// Throws 409 if another active user already has this username or email (case-insensitive).
// Deleted users don't count, so their username/email can be reused.
// `ignoreId` is the user being updated, so saving a user unchanged doesn't conflict with itself.
export function assertUnique(users, candidate, ignoreId) {
  const errors = {};

  for (const field of UNIQUE_FIELDS) {
    const wanted = candidate[field].toLowerCase();
    const taken = users.some((u) => isActive(u) && u.id !== ignoreId && u[field].toLowerCase() === wanted);
    if (taken) errors[field] = 'is already taken';
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(409, 'Conflicts with an existing user', errors);
  }
}
