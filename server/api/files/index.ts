/**
 * Example R2 Storage API Routes - File Operations
 *
 * Demonstrates file listing from R2
 */

export default defineEventHandler(async (event) => {
    const auth = useAuth(event)
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const method = event.method
    const query = getQuery(event)

    // GET - List files
    if (method === 'GET') {
        const prefix = query.prefix as string || ''
        const limit = Number(query.limit) || 100
        const cursor = query.cursor as string

        const result = await listR2(event, { prefix, limit, cursor, include: ['httpMetadata'] })

        return {
            success: true,
            data: {
                files: result.objects.map(obj => ({
                    key: obj.key,
                    size: obj.size,
                    etag: obj.etag,
                    contentType: obj.httpMetadata?.contentType || null,
                    uploadedAt: obj.uploaded ? new Date(obj.uploaded).toISOString() : null,
                })),
                truncated: result.truncated,
                cursor: result.cursor,
            },
        }
    }

    throw createError({
        statusCode: 405,
        message: 'Method not allowed',
    })
})
