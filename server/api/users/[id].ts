/**
 * Example D1 Database API Routes - Single User
 *
 * Demonstrates read, update, delete operations
 */
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
    const db = useDatabase(event)
    const method = event.method
    const id = Number(getRouterParam(event, 'id'))

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid user ID',
        })
    }

    // GET - Get a single user
    if (method === 'GET') {
        const user = await db.select().from(users).where(eq(users.id, id)).get()

        if (!user) {
            throw createError({
                statusCode: 404,
                message: 'User not found',
            })
        }

        return {
            success: true,
            data: user,
        }
    }

    // PUT - Update a user
    if (method === 'PUT') {
        const body = await readBody<{ email?: string; name?: string }>(event)

        const updated = await db.update(users)
            .set({
                ...body,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, id))
            .returning()

        if (updated.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'User not found',
            })
        }

        return {
            success: true,
            data: updated[0],
        }
    }

    // DELETE - Delete a user
    if (method === 'DELETE') {
        const deleted = await db.delete(users).where(eq(users.id, id)).returning()

        if (deleted.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'User not found',
            })
        }

        return {
            success: true,
            data: deleted[0],
        }
    }

    throw createError({
        statusCode: 405,
        message: 'Method not allowed',
    })
})
