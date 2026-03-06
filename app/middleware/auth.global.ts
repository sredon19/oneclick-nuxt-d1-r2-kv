import { authClient } from '~/lib/auth-client'

const publicRoutes = ['/login']

export default defineNuxtRouteMiddleware(async (to) => {
    if (publicRoutes.includes(to.path)) return

    const { data: session } = await authClient.useSession(useFetch)

    if (!session?.value) {
        return navigateTo('/login')
    }
})
