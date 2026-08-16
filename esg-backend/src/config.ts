import 'dotenv/config';
import path from 'node:path';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable "${name}" is required. Copy .env.example to .env`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: '8h',
  },
  db: {
    path: process.env.DB_PATH ?? path.resolve(process.cwd(), 'data', 'esg.db'),
  },
  upload: {
    dir: process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), 'uploads'),
    maxSizeMb: Number(process.env.UPLOAD_MAX_SIZE_MB ?? 10),
  },
} as const;

export type Config = typeof config;