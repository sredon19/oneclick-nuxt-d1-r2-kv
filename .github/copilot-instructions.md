# Nuxt + Cloudflare Workers - Contributor Instructions

## Architecture summary

- Runtime target is **Cloudflare Workers**, not Pages.
- Nuxt Nitro preset must stay `cloudflare-module`.
- Cloudflare bindings are provided via `event.context.cloudflare.env`.
- Auth is implemented with Better Auth + Drizzle adapter.

Core services in this template:
- `DB` (D1)
- `KV` (Cloudflare KV)
- `BUCKET` (R2)
- `HYPERDRIVE` (optional)

## Non-negotiable conventions

1. Prefer utilities over direct binding access:
   - `useDatabase` / `useD1`
   - `useKV`
   - `useR2`
   - `useHyperdrive`
2. Keep auth flows inside Better Auth endpoints/plugins (`/api/auth/*`).
3. Do not add custom CRUD endpoints for Better Auth core tables (`user`, `session`, `account`, `verification`).
4. For protected APIs, check session with `auth.api.getSession` before data access.
5. Keep route responses consistent:
   - success: `{ success: true, data: ... }`
   - failure: `createError(...)` or `{ success: false, error: ... }` where appropriate.

## Development workflow

```bash
npm run dev            # Nuxt only
npm run dev:cf         # Local Workers runtime (use for bindings/auth tests)
npm run db:migrate:local
npm run db:migrate:remote
npm run deploy
npm run check
```

When behavior depends on D1/KV/R2/auth bindings, test with `npm run dev:cf`.

## Database and migration rules

- Define/modify schema in `server/database/schema.ts`.
- Keep SQL migrations in `server/database/migrations/`.
- Apply migrations locally before proposing production changes.
- Better Auth tables use integer timestamp columns.
- Custom app tables may use explicit string timestamps (for example, ISO text fields).

## API route patterns

- File naming:
  - collection endpoints: `server/api/<resource>/index.ts`
  - dynamic endpoints: `server/api/<resource>/[...param].ts` or `[id].ts`
- Read `event.method` and branch explicitly.
- Return `405` for unsupported methods.
- Validate required inputs and return `400` for invalid requests.

## R2 upload pattern

Multipart uploads should follow this conversion pattern before calling `uploadToR2`:

```ts
const form = await readMultipartFormData(event)
const fileField = form.find(f => f.name === 'file')
const arrayBuffer = fileField.data.buffer.slice(
  fileField.data.byteOffset,
  fileField.data.byteOffset + fileField.data.byteLength
) as ArrayBuffer
```

## Files to reference first

- `server/utils/cloudflare.ts` - binding types and access helpers
- `server/utils/auth.ts` - Better Auth server configuration
- `server/utils/database.ts` - D1 + Drizzle access
- `server/utils/kv.ts` - KV helpers
- `server/utils/blob.ts` - R2 helpers
- `server/database/schema.ts` - source of truth for tables
- `wrangler.jsonc` - binding names/config
- `nuxt.config.ts` - Nuxt + Nitro runtime config

## Common pitfalls

1. Using Pages-specific assumptions in a Workers project.
2. Accessing bindings inconsistently across routes.
3. Skipping session checks on routes that should be protected.
4. Forgetting method guards (`405`) and input validation (`400`).
5. Changing schema without a corresponding migration.
