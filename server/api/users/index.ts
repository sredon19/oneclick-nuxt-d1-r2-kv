import { user } from '../../database/schema'

export default defineEventHandler(async (event) => {
    const auth = useAuth(event)
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const db = useDatabase(event)
    const method = event.method

    if (method === 'GET') {
        const allUsers = await db.select().from(user)
        return { success: true, data: allUsers }
    }

    if (method === 'POST') {
        const body = await readBody<{ email?: string; name?: string }>(event)
        const normalizedEmail = body.email?.trim().toLowerCase()

        if (!normalizedEmail) {
            throw createError({ statusCode: 400, message: 'Email is required' })
        }

        const now = new Date()
        const displayName = body.name?.trim() || normalizedEmail.split('@')[0] || 'User'

        try {
            const created = await db.insert(user).values({
                id: crypto.randomUUID(),
                email: normalizedEmail,
                name: displayName,
                emailVerified: false,
                image: null,
                createdAt: now,
                updatedAt: now,
            }).returning()

            return { success: true, data: created[0] }
        }
        catch (error) {
            const message = error instanceof Error ? error.message.toLowerCase() : ''
            if (message.includes('unique')) {
                throw createError({ statusCode: 409, message: 'Email already exists' })
            }
            throw error
        }
    }

    throw createError({ statusCode: 405, message: 'Method not allowed' })
})
