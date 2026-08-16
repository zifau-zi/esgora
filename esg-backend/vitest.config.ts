import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const testDbPath = path.join(mkdtempSync(path.join(tmpdir(), 'esg-test-')), 'test.db');

export default defineConfig({
  test: {
    env: {
      DB_PATH: testDbPath,
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test',
    },
    // isolates=true membuat tiap file punya module registry sendiri
    // sehingga config.js terbaca dengan env test di atas.
  },
});
