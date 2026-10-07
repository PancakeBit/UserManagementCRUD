import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../../data/user.json');

export async function readUsers() {
  const raw = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Write to a temp file then rename: a crash mid-write can't leave user.json half-written.
export async function writeUsers(users) {
  const tmp = `${DATA_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(users, null, 2), 'utf-8');
  await rename(tmp, DATA_FILE);
}
