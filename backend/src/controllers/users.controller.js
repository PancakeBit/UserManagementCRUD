import { HttpError } from '../utils/HttpError.js';
import { parseListQuery } from "../validators/listQuery.validator.js";
import { FIELD_NAMES, isActive } from "../models/user.js";
import { parseUserBody, assertUnique } from "../validators/user.validator.js";
import { parseIdParam } from "../validators/common.js";


const contains = (value, term) => String(value).toLowerCase().includes(term);

// Position of the active user with this id, or a 404 (deleted users count as missing).
// Shared by get, update and delete.
function findUserIndex(users, id) {
  const index = users.findIndex((u) => u.id === id && isActive(u));
  if (index === -1) throw new HttpError(404, `User ${id} not found`);
  return index;
}

// The store is passed in, not imported: the controller never knows which file it's using.
export function createUsersController(store) {
  // GET /api/users?q=&name=&username=&email=&id=&page=&limit=
  async function listUsers(request, response) {
    const { page, limit, id, q, fieldFilters } = parseListQuery(request.query);

    // Deleted users are never listed, searched or counted
    let users = (await store.readUsers()).filter(isActive);

    // q: match in ANY text field (OR)
    if (q)
      users = users.filter((u) => FIELD_NAMES.some((f) => contains(u[f], q)));
    // field filters: match ALL given fields (AND)
    users = users.filter((u) =>
      fieldFilters.every(([field, term]) => contains(u[field], term)),
    );
    // id: exact match
    if (id !== undefined) users = users.filter((u) => u.id === id);

    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    // Page 1 is always valid, even with no results.
    const lastPage = Math.max(totalPages, 1);
    if (page > lastPage) {
      throw new HttpError(400, "Invalid query parameters", {
        page: `must be at most ${lastPage}`,
      });
    }
    const start = (page - 1) * limit;

    response.json({
      data: users.slice(start, start + limit),
      page,
      limit,
      total,
      totalPages,
    });
  }

  // GET /api/users/:id
  async function getUser(request, response) {
    const id = parseIdParam(request.params.id);
    const users = await store.readUsers();
    const user = users[findUserIndex(users, id)];

    response.json(user);
  }

  // POST /api/users
  async function createUser(request, response) {
    // Validate outside the queue: needs no data, keeps the queue short
    const data = parseUserBody(request.body);

    // Race condition avoidance: Queue writes so that simultaneous requests
    // can't overwrite each other.
    const newUser = await store.modifyWithWriteLock((users) => {
      // Inside the queue, so this sees every earlier write. Throws 409 if username/email taken.
      assertUnique(users, data);

      // Includes deleted users, so a deleted user's id is never handed out again
      const latestId = users.reduce((max, u) => Math.max(max, u.id), 0);
      const created = { ...data, id: latestId + 1 };

      users.push(created);
      return created;
    });

    response.status(201).json(newUser);
  }

  // PUT /api/users/:id
  async function updateUser(request, response) {
    const data = parseUserBody(request.body);
    const id = parseIdParam(request.params.id);

    const updatedUser = await store.modifyWithWriteLock((users) => {
      const index = findUserIndex(users, id);

      // Pass `id` so the user doesn't conflict with their own current username/email
      assertUnique(users, data, id);

      // PUT replaces the whole record; only the id is kept
      const replaced = { ...data, id };
      users[index] = replaced;
      return replaced;
    });

    response.json(updatedUser);
  }

  // DELETE /api/users/:id
  async function deleteUser(request, response) {
    // Validate request parameter before checking the store
    const id = parseIdParam(request.params.id);

    // Enter the queue to read -> mutate
    await store.modifyWithWriteLock((users) => {
      // Read
      const index = findUserIndex(users, id); // Throws 404 if not found (or already deleted)
      // Mutate: soft delete. The record stays in the file so its id is never reused.
      users[index].deleted = true;
    });
    response.status(204).send();
  }

  return { listUsers, getUser, createUser, updateUser, deleteUser };
}
