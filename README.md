# 🤸 rezervo-web

[![rezervo-web](https://img.shields.io/badge/ghcr.io-mathiazom%2Frezervo--web-blue?logo=docker)](https://github.com/users/mathiazom/packages/container/package/rezervo-web)

Web client for [`rezervo`](https://github.com/mathiazom/rezervo), including booking schedules and user preferences.

### Setup

Define your own `.env.local` from `.env.local.example`

```
cp .env.local.example .env.local
```

If you want [on-demand revalidation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation), make sure to define `REVALIDATION_SECRET_TOKEN` in `.env.local`
