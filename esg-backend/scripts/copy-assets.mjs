import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const src = join(root, 'src', 'db', 'migrations');
const dst = join(root, 'dist', 'db', 'migrations');

mkdirSync(dst, { recursive: true });
for (const file of readdirSync(src)) {
  copyFileSync(join(src, file), join(dst, file));
}
console.log('[build] copied migration assets');