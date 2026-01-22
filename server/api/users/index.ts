/**
 * Example D1 Database API Routes
 *
 * Demonstrates CRUD operations using D1 with Drizzle ORM
 */
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
    const db = useDatabase(event)
    const method = event.method

    // GET - List all users
    if (method === 'GET') {
        const allUsers = await db.select().from(users)
        return {
            success: true,
            data: allUsers,
        }
    }

    // POST - Create a new user
    if (method === 'POST') {
        const body = await readBody<{ email: string; name?: string }>(event)

        if (!body.email) {
            throw createError({
                statusCode: 400,
                message: 'Email is required',
            })
        }

        const newUser = await db.insert(users).values({
            email: body.email,
            name: body.name || null,
        }).returning()

        return {
            success: true,
            data: newUser[0],
        }
    }

    throw createError({
        statusCode: 405,
        message: 'Method not allowed',
    })
})
