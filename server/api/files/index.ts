/**
 * Example R2 Storage API Routes - File Operations
 *
 * Demonstrates file listing from R2
 */

export default defineEventHandler(async (event) => {
    const method = event.method
    const query = getQuery(event)

    // GET - List files
    if (method === 'GET') {
        const prefix = query.prefix as string || ''
        const limit = Number(query.limit) || 100
        const cursor = query.cursor as string

        const result = await listR2(event, { prefix, limit, cursor })

        return {
            success: true,
            data: {
                files: result.objects.map(obj => ({
                    key: obj.key,
                    size: obj.size,
                    etag: obj.etag,
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
