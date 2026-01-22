import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Example Users table for D1 (SQLite)
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    name: text('name'),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// Example Sessions table for KV-backed sessions
export const sessions = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// Example Files metadata table for R2 blob tracking
export const files = sqliteTable('files', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    key: text('key').notNull().unique(), // R2 object key
    filename: text('filename').notNull(),
    contentType: text('content_type'),
    size: integer('size'),
    userId: integer('user_id').references(() => users.id),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// Export all schemas
export const schema = {
    users,
    sessions,
    files,
}
