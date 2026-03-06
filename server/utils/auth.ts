import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { organization } from 'better-auth/plugins'
import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'
import { adminRole, memberRole, orgAccessControl, ownerRole } from '../../shared/auth/access'
import * as schema from '../database/schema'

export function useAuth(event: H3Event) {
    const env = useCloudflareEnv(event)

    if (!env.BETTER_AUTH_SECRET) {
        throw new Error('BETTER_AUTH_SECRET is not configured.')
    }

    const db = drizzle(env.DB, { schema })

    const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)

    return betterAuth({
        baseURL: env.BETTER_AUTH_URL || undefined,
        secret: env.BETTER_AUTH_SECRET,
        database: drizzleAdapter(db, { provider: 'sqlite' }),
        socialProviders: googleEnabled
            ? {
                google: {
                    clientId: env.GOOGLE_CLIENT_ID!,
                    clientSecret: env.GOOGLE_CLIENT_SECRET!,
                },
            }
            : {},
        plugins: [
            organization({
                ac: orgAccessControl,
                roles: {
                    owner: ownerRole,
                    admin: adminRole,
                    member: memberRole,
                },
            }),
        ],
        session: {
            expiresIn: 60 * 60 * 24 * 30, // 30 days
            updateAge: 60 * 60 * 24, // refresh daily
        },
        advanced: {
            ipAddress: {
                ipAddressHeaders: ['cf-connecting-ip'],
            },
        },
    })
}

export type Auth = ReturnType<typeof useAuth>
