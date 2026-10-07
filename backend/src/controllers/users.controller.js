import { HttpError } from '../utils/HttpError.js';
import { parseListQuery, TEXT_FIELDS } from '../validators/listQuery.validator.js';

const contains = (value, term) => String(value).toLowerCase().includes(term);

// The store is passed in, not imported: the controller never knows which file it's using.
export function createUsersController(store) {
  // GET /api/users?q=&name=&username=&email=&id=&page=&limit=
  async function listUsers(req, res) {
    const { page, limit, id, q, fieldFilters } = parseListQuery(req.query);

    let users = await store.readUsers();

    // q: match in ANY text field (OR)
    if (q) users = users.filter((u) => TEXT_FIELDS.some((f) => contains(u[f], q)));
    // field filters: match ALL given fields (AND)
    users = users.filter((u) => fieldFilters.every(([field, term]) => contains(u[field], term)));
    // id: exact match
    if (id !== undefined) users = users.filter((u) => u.id === id);

    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    // Page 1 is always valid, even with no results.
    const lastPage = Math.max(totalPages, 1);
    if (page > lastPage) {
      throw new HttpError(400, 'Invalid query parameters', { page: `must be at most ${lastPage}` });
    }
    const start = (page - 1) * limit;

    res.json({
      data: users.slice(start, start + limit),
      page,
      limit,
      total,
      totalPages,
    });
  }

  // GET /api/users/:id
  async function getUser(req, res) {
    // TODO: find by id, 404 if missing
    throw new HttpError(501, 'Not implemented');
  }

  // POST /api/users
  async function createUser(req, res) {
    // TODO: validate body, assign id, append, write, respond 201
    throw new HttpError(501, 'Not implemented');
  }

  // PUT /api/users/:id
  async function updateUser(req, res) {
    // TODO: 404 if missing, validate body, replace fields, write, respond 200
    throw new HttpError(501, 'Not implemented');
  }

  // DELETE /api/users/:id
  async function deleteUser(req, res) {
    // TODO: 404 if missing, remove, write, respond 204
    throw new HttpError(501, 'Not implemented');
  }

  return { listUsers, getUser, createUser, updateUser, deleteUser };
}
