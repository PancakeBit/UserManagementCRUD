import { useId, useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { FIELD_NAMES, USER_FIELDS, validateField, validateUser } from '../validation/userRules.js';

const EMPTY_USER = { name: '', username: '', email: '' };

// One form for both create and edit. `user` set = edit mode, prefilled.
// onSubmit(values) returns a promise; if it rejects with an ApiError, the server's
// per-field `details` are shown under the matching inputs.
export default function UserFormDialog({ open, user, onClose, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose} titleId="user-form-title">
      {/* key: switching between users (or to create) remounts the form with fresh state */}
      <UserForm key={user?.id ?? 'new'} user={user} onCancel={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

function UserForm({ user, onCancel, onSubmit }) {
  const isEdit = Boolean(user);
  const [values, setValues] = useState(() =>
    isEdit ? { name: user.name, username: user.username, email: user.email } : EMPTY_USER,
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null); // problems not tied to one field
  const [submitting, setSubmitting] = useState(false);

  function setFieldError(field, message) {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Once a field shows an error, re-check as the user types so it clears the moment it's fixed.
    if (errors[field]) setFieldError(field, validateField(field, value));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validateUser(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      document.getElementById(fieldId(Object.keys(clientErrors)[0]))?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
      // Success: the parent closes the dialog, which unmounts this form.
    } catch (err) {
      showServerErrors(err);
      setSubmitting(false);
    }
  }

  // 400 (invalid) and 409 (username/email taken) carry { field: message } details.
  // Fields the form has get the message inline; anything else goes in the form-level line.
  function showServerErrors(err) {
    const details = err.details ?? {};
    const fieldErrors = {};
    const otherErrors = [];
    for (const [key, message] of Object.entries(details)) {
      if (FIELD_NAMES.includes(key)) fieldErrors[key] = message;
      else otherErrors.push(`${key} ${message}`);
    }
    setErrors(fieldErrors);
    if (otherErrors.length > 0 || Object.keys(fieldErrors).length === 0) {
      setFormError([err.message, ...otherErrors].join(': '));
    }
  }

  const idPrefix = useId();
  const fieldId = (field) => `${idPrefix}-${field}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 id="user-form-title" className="font-display text-xl uppercase tracking-wide">
        {isEdit ? 'Edit user' : 'New user'}
      </h2>
      {isEdit && <p className="mt-1 font-display text-sm opacity-70">No. {String(user.id).padStart(3, '0')}</p>}

      <div className="mt-6 space-y-5">
        {FIELD_NAMES.map((field, index) => (
          <Field
            key={field}
            id={fieldId(field)}
            label={USER_FIELDS[field].label}
            type={field === 'email' ? 'email' : 'text'}
            value={values[field]}
            error={errors[field]}
            autoFocus={index === 0}
            onChange={(value) => handleChange(field, value)}
            onBlur={() => setFieldError(field, validateField(field, values[field]))}
          />
        ))}
      </div>

      {formError && (
        <p role="alert" className="mt-5 text-sm text-accent2">
          {formError}
        </p>
      )}

      <div className="mt-8 flex justify-end gap-2">
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add user'}
        </Button>
      </div>
    </form>
  );
}

function Field({ id, label, error, onChange, ...inputProps }) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-1 w-full border-b-2 bg-transparent px-1 py-1.5 outline-none focus:border-accent ${
          error ? 'border-accent2' : 'border-ink/30'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-accent2">
          {label} {error}
        </p>
      )}
    </div>
  );
}
