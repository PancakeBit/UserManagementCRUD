import { HttpError } from '../utils/HttpError.js';
import { isPositiveIntString } from "./common.js";
import { FIELD_NAMES } from "../models/user.js";

const ALLOWED_PARAMS = ['q', 'id', 'page', 'limit', ...FIELD_NAMES];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 100;

// Parses GET /api/users query params.
// Absent params get defaults, invalid params throw 400 with { param: message } details.
// All problems are collected and thrown together as one 400 with { param: message } details.
export function parseListQuery(query) {
  // Validate query params
  const errors = Object.create(null);

  for (const key of Object.keys(query)) {
    if (!ALLOWED_PARAMS.includes(key)) errors[key] = "unknown query parameter";
  }

  // Returns the param's text, or undefined if it wasn't sent.
  // Records an error (and returns undefined) if it was sent twice (?q=a&q=b) or is blank (?q=).
  function readString(key) {
    const value = query[key];
    if (value === undefined) return undefined;
    if (typeof value !== "string") {
      errors[key] = "must be given at most once";
      return undefined;
    }
    const withoutOuterSpaces = value.trim();
    if (withoutOuterSpaces === "") {
      errors[key] = "must not be empty";
      return undefined;
    }
    return withoutOuterSpaces;
  }

  function readPositiveInt(key, max) {
    const raw = readString(key);
    if (raw === undefined) return undefined;
    if (!isPositiveIntString(raw)) {
      errors[key] = "must be a positive integer";
      return undefined;
    }
    const n = Number(raw);
    if (max !== undefined && n > max) {
      errors[key] = `must be at most ${max}`;
      return undefined;
    }
    return n;
  }

  const page = readPositiveInt("page") ?? DEFAULT_PAGE;
  const limit = readPositiveInt("limit", MAX_LIMIT) ?? DEFAULT_LIMIT;
  const id = readPositiveInt("id");
  const q = readString("q")?.toLowerCase();
  const fieldFilters = FIELD_NAMES.map((field) => [
    field,
    readString(field)?.toLowerCase(),
  ]).filter(([, term]) => term !== undefined);

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Invalid query parameters", errors);
  }

  return { page, limit, id, q, fieldFilters };
}
