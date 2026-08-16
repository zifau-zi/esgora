# ============================================================================
# Dockerfile — Backend ESG Sekolah
# Cocok untuk Render, Railway, Fly.io, atau VPS (bukan Vercel/Netlify — itu
# serverless & databasenya pakai SQLite lokal).
# ============================================================================

# ---- Stage 1: dependencies + build ----
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src

RUN npm run build

# ---- Stage 2: runtime (lebih ramping) ----
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Direktori runtime (SQLite & upload) — wajib dipetakan ke disk persisten
# bila data mau bertahan (Render: mount disk ke /app/data dan /app/uploads;
# di beberapa platform, data akan hilang tiap redeploy kalau tidak).
RUN mkdir -p /app/data /app/uploads

EXPOSE 3000

CMD ["node", "dist/index.js"]