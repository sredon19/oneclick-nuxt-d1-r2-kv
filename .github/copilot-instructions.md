# Nuxt + Cloudflare Workers Project - AI Coding Guide

## Project Architecture

This is a **Nuxt 4 application deployed on Cloudflare Workers** (not Pages) using the `cloudflare-module` preset. The project demonstrates full-stack integration with Cloudflare's edge storage services:

- **D1 (SQLite)**: Relational database managed via Drizzle ORM
- **KV**: Key-value storage for caching and sessions
- **R2**: Object storage for files and blobs
- **Hyperdrive**: Optional connection pooling for external PostgreSQL/MySQL

**Critical distinction**: This uses Workers, not Pages. The `nitro.preset` in [nuxt.config.ts](nuxt.config.ts) is `cloudflare-module` and bindings come from `event.context.cloudflare.env`.

## Cloudflare Binding Access Pattern

All Cloudflare services are accessed via utility functions that extract bindings from `event.context.cloudflare.env`:

```typescript
// Database: useDatabase(event) or useD1(event)
const db = useDatabase(event)
const users = await db.select().from(schema.users)

// KV: useKV(event)
const kv = useKV(event)
await kv.put('key', JSON.stringify(data), { expirationTtl: 3600 })

// R2: useR2(event)
const bucket = useR2(event)
await bucket.put('file.txt', data, { httpMetadata: { contentType: 'text/plain' } })
```

**Never** access bindings directly. Always use the utility functions in [server/utils/](server/utils/).

## Database Conventions

1. **Schema Location**: All tables defined in [server/database/schema.ts](server/database/schema.ts) using Drizzle ORM
2. **Migrations**: SQL files in [server/database/migrations/](server/database/migrations/)
3. **Date Handling**: D1 stores dates as ISO strings (`TEXT` columns with `.$defaultFn(() => new Date().toISOString())`)
4. **Foreign Keys**: Use `.references(() => otherTable.column)` in schema, applied in migrations
5. **Auto-increment**: Use `integer('id').primaryKey({ autoIncrement: true })`

Example table definition:
```typescript
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})
```

## File Upload Pattern

File uploads use multipart form data with Buffer → ArrayBuffer conversion for R2 compatibility:

```typescript
const form = await readMultipartFormData(event)
const fileField = form.find(f => f.name === 'file')
const arrayBuffer = fileField.data.buffer.slice(
    fileField.data.byteOffset,
    fileField.data.byteOffset + fileField.data.byteLength
)
await uploadToR2(event, key, arrayBuffer, { contentType: fileField.type })
```

See [server/api/files/upload.ts](server/api/files/upload.ts) for the canonical implementation.

## Development Workflow

```bash
# Standard Nuxt dev (no Cloudflare runtime, uses mocks)
npm run dev

# Local dev with Cloudflare Workers runtime
npm run dev:cf

# Apply migrations locally
npm run db:migrate:local

# Apply migrations to production
npm run db:migrate:remote

# Deploy
npm run deploy
```

**Important**: When testing D1/KV/R2 locally, use `npm run dev:cf` to get real Workers runtime behavior.

## Configuration Files

- [wrangler.jsonc](wrangler.jsonc): Cloudflare bindings (DB, KV, BUCKET, HYPERDRIVE) with placeholder IDs replaced during deployment
- [nuxt.config.ts](nuxt.config.ts): Uses `nitro.preset: 'cloudflare-module'` and `nitro-cloudflare-dev` module
- [drizzle.config.ts](drizzle.config.ts): Uses `dialect: 'sqlite'` and `driver: 'd1-http'` for migrations

## API Route Patterns

Auth flows are handled by Better Auth endpoints and plugins:

- **GET/POST** `/api/auth/*` - Better Auth handlers and plugin endpoints
- **Do not** implement custom CRUD over Better Auth core tables (`user`, `session`, `account`, `verification`)
- For authorization, use Better Auth plugin capabilities (organization/admin/access control) instead of direct DB writes

## Key Files

- [server/utils/cloudflare.ts](server/utils/cloudflare.ts): Binding type definitions and access functions
- [server/utils/database.ts](server/utils/database.ts): Drizzle + D1 integration
- [server/utils/kv.ts](server/utils/kv.ts): KV helpers with JSON serialization
- [server/utils/blob.ts](server/utils/blob.ts): R2 upload/download helpers
- [server/database/schema.ts](server/database/schema.ts): Single source of truth for all tables

## Adding New Features

### Adding a Database Table

1. **Define schema** in [server/database/schema.ts](server/database/schema.ts):
```typescript
export const posts = sqliteTable('posts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    userId: integer('user_id').notNull().references(() => users.id),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})
```

2. **Create migration SQL** in `server/database/migrations/XXXX_description.sql`:
```sql
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
```

3. **Apply migration**:
```bash
npm run db:migrate:local    # Test locally
npm run db:migrate:remote   # Apply to production
```

### Adding an API Route

1. **Create route file** following RESTful structure (`server/api/posts/index.ts` for collection, `server/api/posts/[id].ts` for single resource):

```typescript
import { posts } from '../../database/schema'

export default defineEventHandler(async (event) => {
    const db = useDatabase(event)
    const method = event.method

    if (method === 'GET') {
        const allPosts = await db.select().from(posts)
        return { success: true, data: allPosts }
    }

    if (method === 'POST') {
        const body = await readBody<{ title: string; userId: number }>(event)
        const newPost = await db.insert(posts).values(body).returning()
        return { success: true, data: newPost[0] }
    }

    throw createError({ statusCode: 405, message: 'Method not allowed' })
})
```

2. **For routes with parameters**, use bracket notation (`[id].ts`):
```typescript
export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '')
    const db = useDatabase(event)
    const method = event.method

    if (method === 'GET') {
        const post = await db.select().from(posts).where(eq(posts.id, id)).get()
        if (!post) throw createError({ statusCode: 404, message: 'Not found' })
        return { success: true, data: post }
    }
    // ... PUT, DELETE
})
```

3. **Always return consistent format**: `{ success: boolean, data?: T, error?: string }`

### Adding KV-Based Features

For caching or temporary data:
```typescript
export default defineEventHandler(async (event) => {
    const kv = useKV(event)
    
    // Check cache first
    const cached = await kv.get('cache:posts', { type: 'json' })
    if (cached) return { success: true, data: cached, cached: true }
    
    // Fetch and cache
    const db = useDatabase(event)
    const posts = await db.select().from(schema.posts)
    await kv.put('cache:posts', JSON.stringify(posts), { expirationTtl: 3600 })
    
    return { success: true, data: posts }
})
```

### Adding File Upload Routes

Follow the pattern in [server/api/files/upload.ts](server/api/files/upload.ts):
- Use `readMultipartFormData(event)` for form parsing
- Convert Buffer to ArrayBuffer before R2 upload
- Store metadata in D1 `files` table if needed
- Use meaningful folder prefixes in R2 keys (e.g., `avatars/`, `documents/`)

## Common Pitfalls

1. **Don't use Pages APIs**: This project uses Workers, not Pages. No `context.env`, use `event.context.cloudflare.env` instead
2. **Date strings, not Date objects**: D1 stores dates as ISO strings. Always use `.toISOString()` when inserting
3. **Buffer conversion for R2**: R2 requires ArrayBuffer, not Buffer. Use the slice pattern shown above
4. **No direct binding access**: Always go through utility functions (`useDatabase`, `useKV`, `useR2`)
5. **Migration workflow**: Edit [schema.ts](server/database/schema.ts) first, then generate SQL migration files manually

## One-Click Deploy Context

This template is designed for the Cloudflare Deploy Button, which auto-provisions resources based on [wrangler.jsonc](wrangler.jsonc). The placeholder IDs (`00000000-...`) are automatically replaced during deployment. For manual setup, follow the README instructions to create resources via Wrangler CLI.
