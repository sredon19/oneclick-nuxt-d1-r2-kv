import { eq } from 'drizzle-orm'
import { user } from '../../database/schema'

export default defineEventHandler(async (event) => {
    const auth = useAuth(event)
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const db = useDatabase(event)
    const id = getRouterParam(event, 'id') || ''
    const method = event.method

    if (!id) {
        throw createError({ statusCode: 400, message: 'User id is required' })
    }

    if (method === 'GET') {
        const found = await db.select().from(user).where(eq(user.id, id)).get()

        if (!found) {
            throw createError({ statusCode: 404, message: 'User not found' })
        }

        return { success: true, data: found }
    }

    if (method === 'PUT') {
        const body = await readBody<{ name?: string; image?: string | null; email?: string }>(event)
        const updates: { name?: string; image?: string | null; email?: string; updatedAt: Date } = {
            updatedAt: new Date(),
        }

        if (typeof body.name === 'string' && body.name.trim()) {
            updates.name = body.name.trim()
        }
        if (typeof body.image === 'string' || body.image === null) {
            updates.image = body.image
        }
        if (typeof body.email === 'string' && body.email.trim()) {
            updates.email = body.email.trim().toLowerCase()
        }

        if (!updates.name && updates.image === undefined && !updates.email) {
            throw createError({ statusCode: 400, message: 'No valid fields to update' })
        }

        const updated = await db.update(user).set(updates).where(eq(user.id, id)).returning()

        if (updated.length === 0) {
            throw createError({ statusCode: 404, message: 'User not found' })
        }

        return { success: true, data: updated[0] }
    }

    if (method === 'DELETE') {
        const deleted = await db.delete(user).where(eq(user.id, id)).returning()

        if (deleted.length === 0) {
            throw createError({ statusCode: 404, message: 'User not found' })
        }

        return { success: true, data: deleted[0] }
    }

    throw createError({ statusCode: 405, message: 'Method not allowed' })
})
