FROM node:24-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Needed due to a dependency issue in nitro@3.0.260610-beta
COPY patches/ ./patches/

RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_CONFIG_HOST
ENV VITE_CONFIG_HOST=$VITE_CONFIG_HOST
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
COPY --from=builder --chown=nodejs:nodejs /app/.output ./.output
USER nodejs
EXPOSE 3000
ENV PORT=3000
CMD ["node", ".output/server/index.mjs"]
