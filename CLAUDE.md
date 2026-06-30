# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`rezervo-web` is the Next.js (App Router) web client for [`rezervo`](https://github.com/mathiazom/rezervo),
a service for automatic booking of group fitness classes. It renders booking schedules per gym **chain**
and lets authenticated users manage recurring-booking preferences. All domain data comes from the separate
`rezervo` backend, which owns the database (PostgreSQL via SQLAlchemy + Alembic). This web repo is stateless —
it has no database of its own; it is a presentation + light API-proxy layer over the backend.

## Commands

Package manager is **pnpm only** (`preinstall` runs `only-allow pnpm`; npm/yarn are rejected).

```shell
pnpm dev            # dev server with Turbopack
pnpm build          # production build
pnpm prod           # build + start
pnpm check          # format:check + lint + typecheck, run in parallel (CI gate)
pnpm fix            # format + oxlint --fix
pnpm typecheck      # tsc --noEmit
pnpm lint           # oxlint
```

There is **no test runner** in this project. `pnpm check` is the verification gate — run it before considering
work complete. Type config is `@tsconfig/strictest`, so expect strict null/optional handling.

Requires a `.env.local` (copy from `.env.local.example`) and a running `rezervo` backend. Node version is pinned
in `.nvmrc`.

Dependencies with build scripts must be explicitly approved in `pnpm-workspace.yaml` under `allowBuilds` (pnpm
blocks postinstall scripts by default) — currently `sharp` and `unrs-resolver`. Add new ones there if a package's
native build is silently skipped.

## Environment & backend wiring

The backend host is referenced two ways (see `src/lib/helpers/requests.ts`):

- `NEXT_PUBLIC_CONFIG_HOST` — used for **client-side** (browser) requests (`mode: "client"`).
- `INTERNAL_CONFIG_HOST` — used for **server-side** requests from Server Components / API routes (`mode: "server"`),
  falling back to `NEXT_PUBLIC_CONFIG_HOST`. This split exists so server-side calls can use an internal network
  address (e.g. `host.docker.internal`) while the browser uses the public one.

Auth is **FusionAuth** via OAuth2 Authorization Code + PKCE (`react-oauth2-code-pkce`). The token exchange is
proxied through `src/app/api/auth/token/route.ts` so the `FUSIONAUTH_CLIENT_SECRET` stays server-side. Server-only
env vars are read through `requireServerEnv` / `requireServerAuthConfig` in `src/lib/helpers/env.ts`.

## Architecture

### Multi-chain routing (the central concept)

The app is multi-tenant by gym chain. The main route is `src/app/[chain]/page.tsx`:

- `generateStaticParams` statically generates one page per active chain (`dynamicParams = false` — unknown chains 404).
- Pages are ISR with `revalidate = 300`; on-demand revalidation is available via `src/app/api/revalidate/route.ts`
  (guarded by `REVALIDATION_SECRET_TOKEN`).
- `/` redirects to `/:chain` based on the `rezervo.selectedChain` cookie (see `next.config.ts` redirects +
  `src/app/[chain]/storeSelectedChain.ts`).

### Server → client data flow

Data fetching/caching uses **TanStack Query** (`@tanstack/react-query`). The client is created in
`src/lib/queryProvider.tsx` (a fresh `QueryClient` per request on the server to avoid cross-request state leaks;
a reused singleton in the browser) and wraps the app in `src/app/layout.tsx`. Devtools are included.

`page.tsx` (Server Component) fetches chain metadata via `src/lib/helpers/fetchers.ts`, then **prefetches** the
current week's schedule into a server-side `QueryClient` and ships it to the client via `dehydrate` +
`<HydrationBoundary>`, so the first client render is instant:

1. `page.tsx` calls `queryClient.prefetchQuery({ queryKey: scheduleQueryKey(chain, weekParam), ... })` using
   `fetchScheduleWeekDTOServer` (server-side fetch).
2. `<HydrationBoundary state={dehydrate(queryClient)}>` hands that cache to the client.
3. Client hooks (`useScheduleWeek`, etc.) read the hydrated cache; week navigation fetches more weeks on demand.

**Query keys do not include locations** — `scheduleQueryKey(chain, week)` = `["schedule", chain, week]`. The cached
schedule always holds **all** locations (server prefetch uses the chain's default location ids; client fetches all),
so components must still **filter classes down to the currently selected locations** when displaying. Schedule key /
URL / fetch helpers live in `src/lib/helpers/schedule.ts` (`scheduleQueryKey`, `constructScheduleUrl`,
`fetchScheduleWeekDTO`, `offsetWeekParam`).

**The React Query cache stores the serializable `*DTO` form, not the deserialized domain form**, so it survives
server→client dehydration without losing Luxon `DateTime`s. Hooks pass `select:` (e.g. `deserializeWeekSchedule`)
to deserialize/transform on read — use **module-level stable `select` functions** so React Query can memoize the
(expensive) result. `useScheduleWeek` uses `keepPreviousData` for smooth week navigation;
`usePrefetchAdjacentWeeks` background-prefetches offsets `[-1, 1, 2, 3]`. `staleTime` defaults to 60s globally,
but schedules use `SCHEDULE_STALE_TIME` (1h, matching the server-side cache window).

### Serialization (DTO ↔ domain)

Luxon `DateTime` objects cannot cross the Server→Client boundary. The backend/server layer works with `*DTO`
types (dates as ISO strings, see `src/types/serialization.ts`); the client works with `Rezervo*` domain types
(dates as `DateTime`). Conversions live in `src/lib/serialization/{serializers,deserializers}.ts`. When adding
fields that include dates/times, update both the DTO type and the serializer/deserializer pair.

### Data hooks

Client data fetching is centralized in `src/lib/hooks/use*.ts` using TanStack Query's `useQuery` / `useMutation`,
e.g. `useScheduleWeek`, `useUserConfig`, `useUserSessions`, `useUserChainConfigs`. Authenticated hooks build a
fetcher with `authedFetcher(token)` from `src/lib/utils/fetchUtils.ts` and gate the request on `isAuthenticated`
via `enabled:`. The shared `fetcher` throws a `FetchError` (`{ status,
statusText }`) on non-OK responses — use it as the `useQuery` error type so consumers can branch on `error.status`
(e.g. treating 404 as "no config yet" in `useUserConfig`). Mutations (e.g. `useUserConfig.putUserConfig`) update
the cache in `onSuccess` with `queryClient.setQueryData(...)` and/or `invalidateQueries(...)`, and trigger dependent
hooks' `mutate*` helpers (which wrap `invalidateQueries`) to keep sessions/configs in sync.

`useClassInfo` (`src/lib/hooks/useClassInfo.ts`) syncs the open ClassInfo modal with the `classId` URL search
param so classes are deep-linkable. Chain location id helpers live in `src/lib/helpers/chain.ts`
(`getAllLocationIds`, `getDefaultLocationIds`).

### Recurrent class identity

Recurring bookings are matched to concrete scheduled classes by a derived **recurrent id**
(`activityId_weekday_hour_minute`) — see `src/lib/helpers/recurrentId.ts`. Note `classRecurrentId` shifts weekday
by `(weekday + 6) % 7` to align Luxon's 1–7 (Mon=1) with the backend's 0-based weekday. "Ghost" configs (recurring
bookings whose class isn't in the current schedule) are merged in `Chain.tsx` so they remain visible/removable.

### State

Lightweight global state uses **Zustand** (`src/stores/userStore.ts`: current user id/name, avatar cache-bust
timestamp). Most state is local component state or the TanStack Query cache. UI-persisted filters (selected locations/categories,
excluded class times) are owned by `useScheduleFilters` (`src/lib/hooks/useScheduleFilters.ts`), which holds the
state and persists it to browser storage via `src/lib/helpers/storage.ts`, keyed per chain. It also exposes
`useDeferredValue`-deferred copies of the location/category selections for non-blocking schedule re-filtering.

### PWA / service worker

PWA support via **Serwist** (`@serwist/turbopack`). The service worker source is `src/serviceworker/index.ts`;
it is compiled and served **on demand** by `createSerwistRoute` in `src/app/serwist/[path]/route.ts` — there is
no committed/generated `public/sw.js`. `withSerwist` wraps the config in `next.config.ts`. Push-notification
subscription logic is in `src/lib/hooks/usePushNotificationSubscription.ts`.

## Conventions

- **Tooling**: format with **oxfmt** and lint with **oxlint** (`oxfmt.config.ts` / `oxlint.config.ts`) — not
  prettier/eslint. oxlint runs type-aware. Use the `@/*` path alias (maps to `src/*`); run `pnpm fix` to auto-fix.
- **React Compiler** is enabled (`reactCompiler: true` in `next.config.ts`, via `babel-plugin-react-compiler`), as
  is Next 16 `cacheComponents`. Avoid patterns React Compiler can't optimize.
- **UI**: MUI v9 (`@mui/material`) with Emotion; theme in `src/lib/theme.ts`, applied in `src/app/layout.tsx`.
  Dates/times use Luxon (`src/lib/helpers/date.ts`), with `@mui/x-date-pickers` localized in
  `src/lib/datePickerLocalizationProvider.tsx`. Locale/UI language is Norwegian (`lang="no"`).
- Components live in `src/components/` (modals under `modals/`, schedule grid under `schedule/`); shared logic in
  `src/lib/` (`helpers/`, `hooks/`, `utils/`, `serialization/`); types in `src/types/`.
