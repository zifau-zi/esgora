import { closeDb, migrate } from './connection.js';

try {
  migrate();
  console.log('[migrate] database schema is up to date');
} finally {
  closeDb();
}