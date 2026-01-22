/**
 * Example KV Storage API Routes
 *
 * Demonstrates key-value operations using Cloudflare KV
 */

export default defineEventHandler(async (event) => {
    const method = event.method
    const query = getQuery(event)
    const key = query.key as string

    // GET - Get a value by key or list keys
    if (method === 'GET') {
        if (key) {
            const value = await kvGet(event, key)
            return {
                success: true,
                data: { key, value },
            }
        }

        // List all keys with optional prefix
        const prefix = query.prefix as string || ''
        const result = await kvList(event, { prefix })

        return {
            success: true,
            data: { keys: result.keys.map(k => k.name) },
        }
    }

    // POST - Set a value
    if (method === 'POST') {
        const body = await readBody<{ key: string; value: unknown; ttl?: number }>(event)

        if (!body.key) {
            throw createError({
                statusCode: 400,
                message: 'Key is required',
            })
        }

        await kvPut(event, body.key, body.value, body.ttl ? { expirationTtl: body.ttl } : undefined)

        return {
            success: true,
            data: { key: body.key, value: body.value },
        }
    }

    // DELETE - Delete a key
    if (method === 'DELETE') {
        if (!key) {
            throw createError({
                statusCode: 400,
                message: 'Key query parameter is required',
            })
        }

        await kvDelete(event, key)

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
