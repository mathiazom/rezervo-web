# 🤸 rezervo-web

[![rezervo-web](https://img.shields.io/badge/ghcr.io-mathiazom%2Frezervo--web-blue?logo=docker)](https://github.com/users/mathiazom/packages/container/package/rezervo-web)
[![rezervo.no](https://img.shields.io/endpoint?url=https%3A%2F%2Fhealthchecks.io%2Fb%2F2%2Fd9777ef5-88a5-4732-b798-29760412942b.shields)](https://rezervo.no)

Web client for [`rezervo`](https://github.com/mathiazom/rezervo), including booking schedules and user preferences.

### 🧑‍💻 Development

#### 🧑‍🔧 Setup

1. Install dependencies using pnpm
   ```shell
   pnpm install
   ```
2. Define your own `.env.local` from [`.env.local.example`](.env.local.example)

   ```shell
   cp .env.local.example .env.local
   ```

   > If you want [on-demand revalidation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation), make sure to define `REVALIDATION_SECRET_TOKEN` in `.env.local`

3. Setup and start the [rezervo](https://github.com/mathiazom/rezervo) backend

#### 📦 Run with pnpm

```shell
pnpm dev

# or

pnpm prod
```

#### 🐋 Run with Docker

1. Make sure you have defined `.env.local` as described above
2. With [docker](https://docs.docker.com/get-docker/) and [docker compose](https://docs.docker.com/compose/) installed, run
   ```shell
   docker compose -f docker-compose.dev.yml up -d --build
   ```

#### 🧹 Code style, lint and type checking

```shell
pnpm check

# automatic fixes
pnpm fix
```
