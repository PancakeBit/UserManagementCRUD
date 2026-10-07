import { readFile, writeFile, rename } from "node:fs/promises";

// Factory: the caller decides which file to use. Nothing in here knows the path.
export function createUserStore(filePath) {
  async function readUsers() {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  }

  // Write to a temp file then rename: a crash mid-write can't leave the file half-written.
  async function writeUsers(users) {
    const tmp = `${filePath}.tmp`;
    await writeFile(tmp, JSON.stringify(users, null, 2), "utf-8");
    await rename(tmp, filePath);
  }

  return { readUsers, writeUsers };
}
