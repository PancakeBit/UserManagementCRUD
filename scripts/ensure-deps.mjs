// Runs before `npm start` / `npm run dev`: installs dependencies for any package
// that has never been installed, or whose package-lock.json changed since (e.g. after a pull).
import { existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function needsInstall(dir) {
  // npm writes this file on every install; it's the record of what node_modules holds.
  const installed = path.join(dir, 'node_modules/.package-lock.json');
  if (!existsSync(installed)) return true;
  return statSync(path.join(dir, 'package-lock.json')).mtimeMs > statSync(installed).mtimeMs;
}

for (const name of ['.', 'backend', 'frontend']) {
  const dir = path.join(root, name);
  if (!needsInstall(dir)) continue;
  console.log(`Installing dependencies in ${name === '.' ? 'project root' : name}...`);
  execSync('npm install', { cwd: dir, stdio: 'inherit' });
}
