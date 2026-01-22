# Nuxt + Cloudflare Workers One-Click Deploy

A production-ready Nuxt 4 template with full Cloudflare Workers integration including D1 (SQLite), KV (Key-Value), R2 (Object Storage), and Hyperdrive (PostgreSQL/MySQL pooling).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/YOUR_REPO_NAME)

> **Note:** Replace `YOUR_USERNAME/YOUR_REPO_NAME` in the button URL above with your GitHub repository path.

## One-Click Deploy

Click the **Deploy to Cloudflare** button above to:

1. ✅ Fork this repository to your GitHub account
2. ✅ Auto-provision a D1 database
3. ✅ Auto-provision a KV namespace
4. ✅ Auto-provision an R2 bucket
5. ✅ Deploy to Cloudflare Workers
6. ✅ Set up CI/CD for future pushes

No manual configuration required! The deploy button reads `wrangler.jsonc` and creates all necessary resources automatically.

## Features

- 🚀 **Nuxt 4** - Latest Nuxt framework with full TypeScript support
- ☁️ **Cloudflare Workers** - Edge-first deployment (not Pages)
- 📦 **D1 Database** - SQLite at the edge with Drizzle ORM
- 🗄️ **KV Storage** - Key-value storage for caching and more
- 📁 **R2 Blob Storage** - Object storage for files and assets
- ⚡ **Hyperdrive** - Connection pooling for PostgreSQL/MySQL (optional)
- 📝 **wrangler.jsonc** - Modern JSON configuration with comments
- 🔘 **One-Click Deploy** - Deploy to Cloudflare button auto-provisions everything

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
git clone <your-repo-url>
cd nuxt-cloudflare-oneclick

# Install dependencies
npm install

# Start development server
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

## Accessing Cloudflare Bindings

All Cloudflare bindings are available via `event.context.cloudflare.env`:

```typescript
export default defineEventHandler(async (event) => {
  const { DB, KV, BUCKET, HYPERDRIVE } = event.context.cloudflare.env

  // Use bindings directly
  const result = await DB.prepare('SELECT * FROM users').all()
  const value = await KV.get('my-key')
  const file = await BUCKET.get('my-file.txt')
})
```

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Hyperdrive Documentation](https://developers.cloudflare.com/hyperdrive/)
- [Nuxt Cloudflare Deployment](https://nuxt.com/deploy/cloudflare)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## License

MIT
