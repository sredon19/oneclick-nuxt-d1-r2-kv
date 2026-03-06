# Nuxt + Cloudflare Workers Starter

Production-ready Nuxt 4 starter for Cloudflare Workers with D1, KV, R2, and Better Auth.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sredon19/oneclick-nuxt-d1-r2-kv)

## What this template includes

- Nuxt 4 + Nitro `cloudflare-module` preset (Workers runtime, not Pages)
- Cloudflare D1 (SQLite) with Drizzle ORM schema + SQL migrations
- Cloudflare KV utilities and example API endpoints
- Cloudflare R2 utilities and file upload/download endpoints
- Better Auth with Google social login and organization plugin
- Optional Hyperdrive binding for external PostgreSQL/MySQL

## Project structure

```text
.
├── app/
│   ├── lib/auth-client.ts
│   ├── middleware/auth.global.ts
│   └── pages/
├── server/
│   ├── api/
│   │   ├── auth/[...all].ts
│   │   ├── health.ts
│   │   ├── kv/index.ts
│   │   ├── files/index.ts
│   │   ├── files/upload.ts
│   │   ├── files/[...key].ts
│   │   └── hyperdrive/index.ts
│   ├── database/
│   │   ├── schema.ts
│   │   └── migrations/
│   └── utils/
│       ├── cloudflare.ts
│       ├── database.ts
│       ├── kv.ts
│       ├── blob.ts
│       ├── hyperdrive.ts
│       └── auth.ts
├── nuxt.config.ts
└── wrangler.jsonc
```

## Quick start

### Prerequisites

- Node.js 24.x recommended (matches Volta config in `package.json`)
- npm
- Cloudflare account + Wrangler CLI access (`npx wrangler ...`)

### Install

```bash
git clone https://github.com/sredon19/oneclick-nuxt-d1-r2-kv.git
cd oneclick-nuxt-d1-r2-kv
npm install
```

### Local development modes

```bash
# Nuxt dev server only (no real Cloudflare bindings)
npm run dev

# Build + run with local Workers runtime (recommended for API/auth/storage testing)
npm run dev:cf
```

Important:
- `npm run dev` is useful for UI iteration.
- `npm run dev:cf` is the mode that reflects Workers behavior for D1/KV/R2/auth.

## Environment and secrets

Use `.env.example` as the source of expected values.

Typical values:
- `BETTER_AUTH_URL` (for local Wrangler dev, usually `http://localhost:8787`)
- `BETTER_AUTH_SECRET` (required)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (required for Google sign-in)

For deployed environments, store sensitive values as Wrangler secrets:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

## Database migrations

```bash
# Generate + apply migrations to local D1
npm run db:migrate:local

# Apply migrations to remote D1
npm run db:migrate:remote
```

`npm run deploy` runs build, remote migrations, and Worker deploy.

## One-click deploy

Use the deploy button at the top of this README to:

1. Fork this repo
2. Provision D1, KV, and R2 resources
3. Deploy to Cloudflare Workers

After one-click deploy, run a deploy from your machine so migrations are applied to your D1 database:

```bash
npx wrangler login
npm run deploy
```

## Manual Cloudflare setup (without deploy button)

```bash
npx wrangler login
npx wrangler d1 create nuxt-app-db
npx wrangler kv namespace create KV
npx wrangler r2 bucket create nuxt-app-files
```

Then update `wrangler.jsonc` with generated IDs/names and run:

```bash
npm run db:migrate:remote
npm run deploy
```

## API routes

All example routes below require an authenticated session, except `/api/auth/*`.

- `GET /api/health` - checks configured bindings
- `GET /api/kv?key=<key>` - get KV value
- `GET /api/kv?prefix=<prefix>` - list KV keys
- `POST /api/kv` - write KV value (`{ key, value, ttl? }`)
- `DELETE /api/kv?key=<key>` - delete KV value
- `GET /api/files` - list R2 files
- `POST /api/files/upload` - upload file via multipart form (`file`, optional `folder`)
- `GET /api/files/:key` - download file
- `DELETE /api/files/:key` - delete file
- `GET /api/hyperdrive` - inspect Hyperdrive binding status
- `GET/POST /api/auth/*` - Better Auth handler routes

## Access pattern for Cloudflare bindings

Prefer utility wrappers in `server/utils`:

```ts
const db = useDatabase(event)
const kv = useKV(event)
const bucket = useR2(event)
```

They read bindings from `event.context.cloudflare.env` and keep route code consistent.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Nuxt dev server |
| `npm run dev:cf` | Build + run local Workers runtime |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview Nuxt build locally |
| `npm run check` | Typecheck + Prettier check + ESLint |
| `npm run format` | Prettier write |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate:local` | Generate + apply local D1 migrations |
| `npm run db:migrate:remote` | Apply remote D1 migrations |
| `npm run deploy` | Build + migrate remote DB + deploy Worker |

## Notes on Hyperdrive

Hyperdrive is optional and commented out in `wrangler.jsonc` by default.

If you enable it:
- uncomment the `hyperdrive` section in `wrangler.jsonc`
- create a Hyperdrive config in Cloudflare
- update the binding ID in `wrangler.jsonc`

## License

MIT
