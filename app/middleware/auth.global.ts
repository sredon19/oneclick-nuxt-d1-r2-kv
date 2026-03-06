import { authClient } from '~/lib/auth-client'

const publicRoutes = ['/login']

export default defineNuxtRouteMiddleware(async (to) => {
    if (publicRoutes.includes(to.path)) return

    const { data: session } = await authClient.getSession()

    if (!session) {
        return navigateTo('/login')
    }
})
