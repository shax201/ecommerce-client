# syntax=docker/dockerfile:1.7

# Multi-stage build for Next.js (Node 20 + Bun)

ARG NODE_VERSION=20
ARG BUN_VERSION=1.1.34

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat curl

# Install Bun (used for scripts/tools if needed)
RUN curl -fsSL https://bun.sh/install | bash -s -- bun-v${BUN_VERSION} && \
    mv /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

# --- deps stage: install node_modules with frozen lockfile ---
FROM base AS deps
COPY package.json bun.lock* package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Prefer npm ci if package-lock exists, else fall back to bun install (reads bun.lock)
RUN if [ -f package-lock.json ]; then \
      npm ci --ignore-scripts; \
    elif [ -f yarn.lock ]; then \
      corepack enable && corepack prepare yarn@stable --activate && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile; \
    else \
      bun install --frozen-lockfile; \
    fi

# --- builder stage: build Next.js app ---
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable Next telemetry in CI/containers
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runner stage: minimal image to run the app ---
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy standalone output for smaller runtime image
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/BUILD_ID ./.next/BUILD_ID

# Ensure the server can find public and .next/static
USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]


