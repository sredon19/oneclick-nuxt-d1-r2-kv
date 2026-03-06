/**
 * Cloudflare bindings utility
 *
 * Provides access to all Cloudflare bindings from the event context
 * Works with Cloudflare Workers (not Pages) using nitro cloudflare-module preset
 */
import type { H3Event } from 'h3'

/**
 * Get all Cloudflare bindings from the current event
 *
 * @example
 * ```ts
 * const { env, ctx } = useCloudflare(event)
 * const db = env.DB
 * const kv = env.KV
 * ```
 */
export function useCloudflare(event?: H3Event) {
    const ev = event || useEvent()
    const cloudflare = ev.context.cloudflare

    if (!cloudflare) {
        // In development, return mock bindings
        if (process.dev) {
            console.warn('Cloudflare context not available in development. Using mock bindings.')
            return { env: {} as CloudflareEnv, ctx: {} }
        }
        throw new Error(
            'Cloudflare context not found. Make sure you are running in a Cloudflare Workers environment.'
        )
    }

    return cloudflare as { env: CloudflareEnv; ctx: ExecutionContext }
}

/**
 * Get the Cloudflare environment bindings
 *
 * @example
 * ```ts
 * const env = useCloudflareEnv(event)
 * const db = env.DB
 * ```
 */
export function useCloudflareEnv(event?: H3Event): CloudflareEnv {
    return useCloudflare(event).env
}

/**
 * Type definition for Cloudflare environment bindings
 * Update this interface to match your wrangler.jsonc configuration
 */
export interface CloudflareEnv {
    // D1 Database
    DB: D1Database

    // KV Namespace
    KV: KVNamespace

    // R2 Bucket
    BUCKET: R2Bucket

    // Durable Objects
    COUNTER?: DurableObjectNamespace

    // Hyperdrive (optional)
    HYPERDRIVE?: Hyperdrive

    // Static Assets
    ASSETS: Fetcher

    // Environment Variables
    ENVIRONMENT: string

    // Auth
    BETTER_AUTH_URL?: string
    BETTER_AUTH_SECRET?: string
    GOOGLE_CLIENT_ID?: string
    GOOGLE_CLIENT_SECRET?: string
}

/**
 * Durable Object Namespace interface
 */
export interface DurableObjectNamespace {
    idFromName(name: string): DurableObjectId
    idFromString(id: string): DurableObjectId
    newUniqueId(): DurableObjectId
    get(id: DurableObjectId): DurableObjectStub
}

/**
 * Durable Object ID interface
 */
export interface DurableObjectId {
    toString(): string
    equals(other: DurableObjectId): boolean
}

/**
 * Durable Object Stub interface
 */
export interface DurableObjectStub {
    fetch(request: Request | string, init?: RequestInit): Promise<Response>
}

/**
 * Cloudflare Fetcher interface for assets
 */
export interface Fetcher {
    fetch(request: Request): Promise<Response>
}

/**
 * Cloudflare D1 Database interface
 */
export interface D1Database {
    prepare(query: string): D1PreparedStatement
    dump(): Promise<ArrayBuffer>
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
    exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement
    first<T = unknown>(colName?: string): Promise<T | null>
    run<T = unknown>(): Promise<D1Result<T>>
    all<T = unknown>(): Promise<D1Result<T>>
    raw<T = unknown>(): Promise<T[]>
}

interface D1Result<T = unknown> {
    results?: T[]
    success: boolean
    error?: string
    meta?: Record<string, unknown>
}

interface D1ExecResult {
    count: number
    duration: number
}

/**
 * Cloudflare KV Namespace interface
 */
export interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<unknown>
    put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expirationTtl?: number; expiration?: number; metadata?: Record<string, unknown> }): Promise<void>
    delete(key: string): Promise<void>
    list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: unknown }[]; list_complete: boolean; cursor?: string }>
}

/**
 * Cloudflare R2 Bucket interface
 */
export interface R2Bucket {
    get(key: string): Promise<R2Object | null>
    put(key: string, value: ReadableStream | ArrayBuffer | string, options?: R2PutOptions): Promise<R2Object>
    delete(key: string | string[]): Promise<void>
    list(options?: R2ListOptions): Promise<R2Objects>
    head(key: string): Promise<R2Object | null>
}

export interface R2Object {
    key: string
    size: number
    etag: string
    httpEtag: string
    uploaded?: Date
    httpMetadata?: Record<string, string>
    customMetadata?: Record<string, string>
    body: ReadableStream
    bodyUsed: boolean
    arrayBuffer(): Promise<ArrayBuffer>
    text(): Promise<string>
    json<T>(): Promise<T>
}

export interface R2PutOptions {
    httpMetadata?: Record<string, string>
    customMetadata?: Record<string, string>
    md5?: ArrayBuffer | string
}

export interface R2ListOptions {
    prefix?: string
    limit?: number
    cursor?: string
    delimiter?: string
    include?: ('httpMetadata' | 'customMetadata')[]
}

export interface R2Objects {
    objects: R2Object[]
    truncated: boolean
    cursor?: string
    delimitedPrefixes: string[]
}

/**
 * Cloudflare Hyperdrive interface
 */
export interface Hyperdrive {
    connectionString: string
    host: string
    port: number
    user: string
    password: string
    database: string
}
