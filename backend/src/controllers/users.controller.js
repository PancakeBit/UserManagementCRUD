import * as store from '../services/userStore.js';
import { HttpError } from '../utils/HttpError.js';

// Express 5 forwards errors thrown in async handlers to errorHandler automatically,
// so handlers can just `throw new HttpError(...)`.

// GET /api/users  — reference implementation
export async function listUsers(req, res) {
  const users = await store.readUsers();
  res.json(users);
}

// GET /api/users/:id
export async function getUser(req, res) {
  // TODO: find by id, 404 if missing
  throw new HttpError(501, 'Not implemented');
}

// POST /api/users
export async function createUser(req, res) {
  // TODO: validate body, assign id, append, write, respond 201
  throw new HttpError(501, 'Not implemented');
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  // TODO: 404 if missing, validate body, replace fields, write, respond 200
  throw new HttpError(501, 'Not implemented');
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  // TODO: 404 if missing, remove, write, respond 204
  throw new HttpError(501, 'Not implemented');
}
