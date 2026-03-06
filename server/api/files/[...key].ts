/**
 * Example R2 Storage API Routes - Single File
 *
 * Demonstrates file retrieval and deletion by key
 */

export default defineEventHandler(async (event) => {
    const auth = useAuth(event)
    const session = await auth.api.getSession({ headers: event.headers })

    if (!session) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const method = event.method

    // Get the file key from the URL path (everything after /api/files/)
    const key = event.path.replace('/api/files/', '')

    if (!key || key === 'upload') {
        throw createError({
            statusCode: 400,
            message: 'File key is required',
        })
    }

    // GET - Download a file
    if (method === 'GET') {
        const file = await getFromR2(event, key)

        if (!file) {
            throw createError({
                statusCode: 404,
                message: 'File not found',
            })
        }

        // Return file with appropriate headers
        setHeader(event, 'Content-Type', file.httpMetadata?.contentType || 'application/octet-stream')
        setHeader(event, 'Content-Length', file.size.toString())
        setHeader(event, 'ETag', file.etag)

        return file.body
    }

    // DELETE - Delete a file
    if (method === 'DELETE') {
        await deleteFromR2(event, key)

        return {
            success: true,
            data: { key, deleted: true },
        }
    }

    throw createError({
        statusCode: 405,
        message: 'Method not allowed',
    })
})
