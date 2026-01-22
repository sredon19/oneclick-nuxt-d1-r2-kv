/**
 * KV Storage utility for accessing Cloudflare KV
 *
 * Uses direct Cloudflare KV bindings via event.context.cloudflare.env
 */
import type { H3Event } from 'h3'

/**
 * Get the KV namespace instance
 *
 * @example
 * ```ts
 * export default defineEventHandler(async (event) => {
 *   const kv = useKV(event)
 *   await kv.put('user:123', JSON.stringify({ name: 'John' }))
 *   const user = await kv.get('user:123', 'json')
 * })
 * ```
 */
export function useKV(event?: H3Event): KVNamespace {
    const env = useCloudflareEnv(event)
    if (!env.KV) {
        throw new Error('KV namespace binding (KV) not found. Check your wrangler.jsonc configuration.')
    }
    return env.KV
}

/**
 * KV helper functions using native Cloudflare KV API
 */

/**
 * Get a value from KV
 */
export async function kvGet<T = unknown>(event: H3Event, key: string): Promise<T | null> {
    const kv = useKV(event)
    return await kv.get(key, { type: 'json' }) as T | null
}

/**
 * Set a value in KV
 */
export async function kvPut(
    event: H3Event,
    key: string,
    value: unknown,
    options?: { expirationTtl?: number }
): Promise<void> {
    const kv = useKV(event)
    await kv.put(key, JSON.stringify(value), options)
}

/**
 * Delete a value from KV
 */
export async function kvDelete(event: H3Event, key: string): Promise<void> {
    const kv = useKV(event)
    await kv.delete(key)
}

/**
 * List keys in KV
 */
export async function kvList(event: H3Event, options?: { prefix?: string; limit?: number; cursor?: string }) {
    const kv = useKV(event)
    return await kv.list(options)
}
