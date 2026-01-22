# Nuxt + Cloudflare Workers One-Click Deploy

A production-ready **Nuxt 4 full-stack starter template** designed for **Cloudflare Workers** deployment with complete edge storage integration. This isn't just a frontend framework—it's a batteries-included backend ready to build real applications with databases, file storage, and caching at the edge.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sredon19/oneclick-nuxt-d1-r2-kv)

> **Try it now:** Click the button above to fork and deploy your own instance in minutes.

## What Makes This Different?

Unlike typical Nuxt templates that focus on frontend-only or Cloudflare Pages deployments, this starter is built specifically for **Cloudflare Workers** with production-ready patterns:

- **Real backend utilities** - Not just bindings, but battle-tested helper functions for D1, KV, and R2
- **Type-safe database** - Drizzle ORM with SQLite (D1) for relational data at the edge
- **Working examples** - Complete CRUD APIs for users, file uploads, and caching
- **Migration system** - Proper database versioning with SQL migrations
- **Edge-first architecture** - Designed for global distribution from day one

## One-Click Deploy

Click the **Deploy to Cloudflare** button above to:

1. ✅ Fork this repository to your GitHub account
2. ✅ Auto-provision a D1 database (SQLite at the edge)
3. ✅ Auto-provision a KV namespace (key-value store)
4. ✅ Auto-provision an R2 bucket (object storage)
5. ✅ Deploy to Cloudflare Workers globally
6. ✅ Set up GitHub Actions CI/CD for automatic deployments

No manual configuration required! The deploy button reads `wrangler.jsonc` and creates all necessary resources automatically.

## Features

### Framework & Deployment
- 🚀 **Nuxt 4** - Latest Nuxt with full TypeScript and auto-imports
- ☁️ **Cloudflare Workers** - True edge deployment (not Pages)
- 📝 **Modern Config** - `wrangler.jsonc` with comments and clear structure

### Edge Storage Services
- 📦 **D1 Database** - SQLite at the edge with Drizzle ORM type safety
- 🗄️ **KV Storage** - Redis-like key-value store for caching and sessions
- 📁 **R2 Blob Storage** - S3-compatible object storage for files
- ⚡ **Hyperdrive** - Connection pooling for PostgreSQL/MySQL (optional)

### Developer Experience
- 🛠️ **Utility Functions** - Clean abstractions over Cloudflare bindings
- 🔄 **Migration System** - Version-controlled SQL migrations for D1
- 📚 **Working Examples** - Complete API routes demonstrating patterns
- 🎯 **Type Safety** - Full TypeScript coverage including Cloudflare APIs
- 🔘 **One-Click Deploy** - Zero-config deployment to production

## Project Structure

```
├── server/
│   ├── api/                    # API routes
│   │   ├── users/              # D1 database example
│   │   ├── kv/                 # KV storage example
│   │   ├── files/              # R2 blob storage example
│   │   ├── hyperdrive/         # Hyperdrive connection example
│   │   └── health.ts           # Health check endpoint
│   ├── database/
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   └── migrations/         # D1 SQL migrations
│   └── utils/
│       ├── cloudflare.ts       # Cloudflare bindings & types
│       ├── database.ts         # D1/Drizzle utilities
│       ├── kv.ts               # KV storage utilities
│       ├── blob.ts             # R2 blob utilities
│       └── hyperdrive.ts       # Hyperdrive utilities
├── wrangler.jsonc              # Cloudflare Workers configuration
└── nuxt.config.ts              # Nuxt configuration
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns status of all Cloudflare bindings.

### Users (D1 Example)
```
GET    /api/users          # List all users
POST   /api/users          # Create a user
GET    /api/users/:id      # Get a user
PUT    /api/users/:id      # Update a user
DELETE /api/users/:id      # Delete a user
```

### KV Storage
```
GET    /api/kv?key=mykey           # Get a value
GET    /api/kv?prefix=user:        # List keys by prefix
POST   /api/kv                     # Set a value { key, value, ttl? }
DELETE /api/kv?key=mykey           # Delete a key
```

### Files (R2)
```
GET    /api/files                  # List files
POST   /api/files/upload           # Upload file (multipart)
GET    /api/files/:key             # Download file
DELETE /api/files/:key             # Delete file
```

### Hyperdrive
```
GET    /api/hyperdrive             # Test connection
```

## Local Development

### Prerequisites

- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/sredon19/oneclick-nuxt-d1-r2-kv.git
cd oneclick-nuxt-d1-r2-kv

# Install dependencies
npm install

# Start development server (with mock bindings)
npm run dev
```

### Local Database

Apply migrations to your local D1 database:

```bash
npm run db:migrate:local
```

### Development with Wrangler

To test with Cloudflare Workers runtime locally:

```bash
npm run dev:cf
```

## Manual Cloudflare Setup

If you prefer manual setup instead of the Deploy button:

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create nuxt-app-db

# Create KV namespace
npx wrangler kv namespace create KV

# Create R2 bucket
npx wrangler r2 bucket create nuxt-app-files

# Update wrangler.jsonc with the generated IDs
# Then apply migrations
npm run db:migrate:remote

# Deploy
npm run deploy
```

## Configuration

### wrangler.jsonc

The `wrangler.jsonc` file contains all Cloudflare bindings:

```jsonc
{
  "name": "nuxt-cloudflare-app",
  "main": ".output/server/index.mjs",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],

  // D1 Database
  "d1_databases": [{
    "binding": "DB",
    "database_name": "nuxt-app-db",
    "database_id": "00000000-0000-0000-0000-000000000000"
  }],

  // KV Namespace
  "kv_namespaces": [{
    "binding": "KV",
    "id": "00000000000000000000000000000000"
  }],

  // R2 Bucket
  "r2_buckets": [{
    "binding": "BUCKET",
    "bucket_name": "nuxt-app-files"
  }],

  // Static assets
  "assets": {
    "directory": ".output/public",
    "binding": "ASSETS"
  }
}
```

> **Note:** The placeholder IDs (`00000000-...`) are automatically replaced when using the Deploy to Cloudflare button.

### nuxt.config.ts

Nuxt is configured with the `cloudflare-module` preset for Workers:

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-module',
  }
})
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:cf` | Start with Wrangler (Workers runtime) |
| `npm run build` | Build for production |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run db:migrate:local` | Apply D1 migrations locally |
| `npm run db:migrate:remote` | Apply D1 migrations to production |

## Using the Server Utilities

### Database (D1 with Drizzle)

```typescript
// server/api/example.ts
import { users } from '../database/schema'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  // Insert a user
  await db.insert(users).values({
    email: 'user@example.com',
    name: 'John Doe'
  })

  // Query users
  const allUsers = await db.select().from(users)
  return allUsers
})
```

### KV Storage

```typescript
// server/api/example.ts
export default defineEventHandler(async (event) => {
  const kv = useKV(event)

  // Set a value (with 1 hour TTL)
  await kv.put('user:123', JSON.stringify({ name: 'John' }), { expirationTtl: 3600 })

  // Get a value
  const user = await kv.get('user:123', { type: 'json' })
  return user
})
```

### Blob Storage (R2)

```typescript
// server/api/example.ts
export default defineEventHandler(async (event) => {
  const bucket = useR2(event)

  // Upload a file
  await bucket.put('documents/file.pdf', fileData, {
    httpMetadata: { contentType: 'application/pdf' }
  })

  // Get a file
  const object = await bucket.get('documents/file.pdf')
  return object?.body
})
```

### Hyperdrive (PostgreSQL)

```typescript
// server/api/example.ts
import postgres from 'postgres'

export default defineEventHandler(async (event) => {
  const connectionString = getHyperdriveConnectionString(event)
  if (!connectionString) {
    throw createError({ statusCode: 500, message: 'Hyperdrive not configured' })
  }

  const sql = postgres(connectionString)
  const result = await sql`SELECT * FROM users`
  return result
})
```

## Hyperdrive Setup (Optional)

Hyperdrive provides connection pooling for external PostgreSQL/MySQL databases:

```bash
# Create Hyperdrive configuration
npx wrangler hyperdrive create nuxt-app-hyperdrive \
  --connection-string="postgresql://user:pass@host:5432/database"

# Uncomment the hyperdrive section in wrangler.jsonc and add the generated ID
```

## Environment Variables

Set secrets using Wrangler:

```bash
npx wrangler secret put MY_SECRET
```

## Architecture Notes

### Workers vs Pages

This project uses **Cloudflare Workers** (not Pages). Key differences:

- **Nitro preset**: `cloudflare-module` (not `cloudflare-pages`)
- **Binding access**: `event.context.cloudflare.env` (Workers runtime)
- **Build output**: `.output/server/index.mjs` (single entry point)

### Why Workers?

Workers provide more flexibility for backend-heavy applications:
- Direct access to all Cloudflare services (D1, KV, R2, Durable Objects)
- Full request/response control
- Better suited for API-first architectures
- No build-time asset limitations

### Accessing Cloudflare Bindings

All Cloudflare bindings are available via `event.context.cloudflare.env`:

```typescript
export default defineEventHandler(async (event) => {
  // Prefer utility functions (recommended)
  const db = useDatabase(event)
  const kv = useKV(event)
  const bucket = useR2(event)

  // Or access bindings directly (if needed)
  const { DB, KV, BUCKET } = event.context.cloudflare.env
})
```

## Use Cases

This template is ideal for:

- **SaaS Applications** - Full-stack apps with user auth, databases, and file storage
- **API Services** - RESTful APIs with global edge deployment
- **Content Platforms** - Blogs, portfolios, or CMS with media storage
- **Real-time Apps** - WebSocket support via Durable Objects (add-on)
- **Mobile Backends** - Fast, globally distributed API backends

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Nuxt Cloudflare Deployment](https://nuxt.com/deploy/cloudflare)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## Contributing

Contributions welcome! Please open an issue or PR on [GitHub](https://github.com/sredon19/oneclick-nuxt-d1-r2-kv).

## License

MIT
