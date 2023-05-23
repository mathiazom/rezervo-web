# 🤸 sit-rezervo-confgen

Web client for [`sit-rezervo`](https://github.com/mathiazom/sit-rezervo), including booking schedules and user preferences.

### Setup

Define your own `.env.local` from `.env.local.example`

```
cp .env.local.example .env.local
```

If you want [on-demand revalidation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation), make sure to define `REVALIDATION_SECRET_TOKEN` in `.env.local`
