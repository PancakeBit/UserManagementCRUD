// Mirrors USER_FIELDS in backend/src/models/user.js so the form can flag mistakes
// before a round trip. The server still validates everything and stays the authority;
// if these drift apart, the server's 400 details show up on the same fields anyway.
export const USER_FIELDS = {
  name: {
    label: 'Name',
    maxLength: 100,
  },
  username: {
    label: 'Username',
    minLength: 3,
    maxLength: 30,
    pattern: /^[A-Za-z0-9._-]+$/,
    patternMessage: 'may only contain letters, digits, ".", "_" and "-"',
  },
  email: {
    label: 'Email',
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'must be a valid email address',
  },
};

export const FIELD_NAMES = Object.keys(USER_FIELDS);

// Same checks, same order and same wording as the backend's parseUserBody.
// Returns the problem as text, or null when the value is fine.
export function validateField(field, value) {
  const rules = USER_FIELDS[field];
  const trimmed = value.trim();

  if (trimmed === '') return 'is required';
  if (rules.minLength && trimmed.length < rules.minLength) return `must be at least ${rules.minLength} characters`;
  if (trimmed.length > rules.maxLength) return `must be at most ${rules.maxLength} characters`;
  if (rules.pattern && !rules.pattern.test(trimmed)) return rules.patternMessage;
  return null;
}

// Returns { field: message } for every invalid field; empty object means valid.
export function validateUser(values) {
  const errors = {};
  for (const field of FIELD_NAMES) {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}
