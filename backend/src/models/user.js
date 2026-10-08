// The single definition of a user's client-editable fields.
// Everything else (body validation, query filters, search, uniqueness, data-file checks) derives from this.
// `id` is not listed: the server assigns it.
export const USER_FIELDS = {
  name: {
    maxLength: 100,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[A-Za-z0-9._-]+$/,
    patternMessage: 'may only contain letters, digits, ".", "_" and "-"',
    unique: true,
  },
  email: {
    maxLength: 254,
    // Deliberately loose: something@something.something, no spaces.
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'must be a valid email address',
    unique: true,
    lowercase: true,
  },
};

export const FIELD_NAMES = Object.keys(USER_FIELDS); // ['name', 'username', 'email']
export const UNIQUE_FIELDS = FIELD_NAMES.filter((field) => USER_FIELDS[field].unique); // ['username', 'email']

// Fields only the server sets. A client sending one gets a 400.
export const SERVER_FIELDS = ['id', 'deleted'];

// Soft delete: a deleted user stays in the file with `deleted: true`, so its id is never reused.
// Active users have no `deleted` field at all. Every lookup, search and uniqueness check uses this.
export const isActive = (user) => user.deleted !== true;
