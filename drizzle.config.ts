import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './server/database/schema.ts',
    out: './server/database/migrations',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        // These are used by drizzle-kit for migrations
        // In development, NuxtHub handles the D1 binding automatically
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
        token: process.env.CLOUDFLARE_API_TOKEN!,
    },
})
