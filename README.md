# 🤸 sit-rezervo-confgen

GUI for quickly generating a `config.yaml` for [`sit-rezervo`](https://github.com/mathiazom/sit-rezervo)

### Setup

Define your own `.env.local` from `.env.local.example`

```
cp .env.local.example .env.local
```

If you want [on-demand revalidation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation), make sure to define `REVALIDATION_SECRET_TOKEN` in `.env.local`
