export default defineNuxtRouteMiddleware(async () => {
    try {
        const request = import.meta.server
            ? useRequestFetch()
            : $fetch

        await request('/api/auth/me')
    } catch {
        return navigateTo('/login')
    }
})
