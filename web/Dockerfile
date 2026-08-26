# Stage 1: Build
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build
RUN bun install --production --frozen-lockfile

# Stage 2: Runtime
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/.env.schema ./
COPY --from=builder /app/.env.production ./

EXPOSE 3000
CMD ["bunx", "varlock", "run", "--", "bun", "run", "build/index.js"]
