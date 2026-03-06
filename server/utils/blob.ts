/**
 * Blob Storage utility for accessing Cloudflare R2
 *
 * Uses direct Cloudflare R2 bindings via event.context.cloudflare.env
 */
import type { H3Event } from 'h3'

export interface UploadedFile {
    key: string
    filename: string
    contentType: string
    size: number
}

/**
 * Get the R2 bucket instance
 *
 * @example
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const bucket = useR2(event)
 *   await bucket.put('files/document.pdf', fileContent)
 * })
 * ```
 */
export function useR2(event?: H3Event): R2Bucket {
    const env = useCloudflareEnv(event)
    if (!env.BUCKET) {
        throw new Error('R2 bucket binding (BUCKET) not found. Check your wrangler.jsonc configuration.')
    }
    return env.BUCKET
}

/**
 * File upload helper
 *
 * @example
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const bucket = useR2(event)
 *   const key = `uploads/${Date.now()}-file.txt`
 *   await bucket.put(key, 'Hello World', { httpMetadata: { contentType: 'text/plain' } })
 * })
 * ```
 */
export async function uploadToR2(
    event: H3Event,
    key: string,
    data: ReadableStream | ArrayBuffer | string,
    options?: { contentType?: string; metadata?: Record<string, string> }
): Promise<UploadedFile> {
    const bucket = useR2(event)
    const result = await bucket.put(key, data, {
        httpMetadata: options?.contentType ? { contentType: options.contentType } : undefined,
        customMetadata: options?.metadata,
    })

    return {
        key: result.key,
        filename: key.split('/').pop() || key,
        contentType: options?.contentType || 'application/octet-stream',
        size: result.size,
    }
}

/**
 * Get a file from R2
 */
export async function getFromR2(event: H3Event, key: string) {
    const bucket = useR2(event)
    return await bucket.get(key)
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(event: H3Event, key: string) {
    const bucket = useR2(event)
    await bucket.delete(key)
}

/**
 * List files in R2 bucket
 */
export async function listR2(
    event: H3Event,
    options?: {
        prefix?: string
        limit?: number
        cursor?: string
        include?: ('httpMetadata' | 'customMetadata')[]
    }
) {
    const bucket = useR2(event)
    return await bucket.list(options)
}
