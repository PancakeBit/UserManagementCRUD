import { readFile, writeFile, rename } from "node:fs/promises";
import { FIELD_NAMES } from "../models/user.js";

// Factory: the caller decides which file to use. Nothing in here knows the path.
export function createUserStore(filePath) {
  // Checks the file's structure, not business rules (those live in validators/).
  // A failure here is a server fault, so it's a plain Error → logged, client sees a 500.
  function assertValidData(data) {
    if (!Array.isArray(data)) {
      throw new Error(`${filePath}: expected a JSON array of users`);
    }

    const seenIds = new Set();
    data.forEach((user, index) => {
      const where = `${filePath}: entry ${index}`;

      if (user === null || typeof user !== "object" || Array.isArray(user)) {
        throw new Error(`${where} is not an object`);
      }
      if (!Number.isInteger(user.id) || user.id < 1) {
        throw new Error(
          `${where} has an invalid id: ${JSON.stringify(user.id)}`,
        );
      }
      if (seenIds.has(user.id)) {
        throw new Error(`${where} has a duplicate id: ${user.id}`);
      }
      seenIds.add(user.id);

      if (user.deleted !== undefined && user.deleted !== true) {
        throw new Error(`${where} (id ${user.id}) has an invalid "deleted": must be true or absent`);
      }

      for (const field of FIELD_NAMES) {
        if (typeof user[field] !== "string") {
          throw new Error(
            `${where} (id ${user.id}) has a missing or non-string "${field}"`,
          );
        }
      }
    });
  }

  async function readUsers() {
    const raw = await readFile(filePath, "utf-8");

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      throw new Error(`${filePath} is not valid JSON`, { cause: err });
    }

    assertValidData(data);
    return data;
  }

  // Write to a temp file then rename: a crash mid-write can't leave the file half-written.
  async function writeUsers(users) {
    const tmp = `${filePath}.tmp`;
    await writeFile(tmp, JSON.stringify(users, null, 2), "utf-8");
    await rename(tmp, filePath);
  }

  // Runs read → mutate → write one at a time, so concurrent requests can't overwrite each other.
  // `mutate` changes the array in place and returns whatever the caller should get back.
  let queue = Promise.resolve();

  function modifyWithWriteLock(mutate) {
    const run = queue.then(async () => {
      const users = await readUsers();
      const result = await mutate(users);
      await writeUsers(users);
      return result;
    });
    queue = run.catch(() => {}); // a failed update (e.g. 409) must not block the ones after it
    return run;
  }

  // writeUsers stays private: the only way to write is through the lock.
  return { readUsers, modifyWithWriteLock };
}
