export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No autenticado'
        })
    }

    const config = useRuntimeConfig()

    try {
        return await $fetch(`${config.laravelApiUrl}/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        })
    } catch {
        deleteCookie(event, 'auth_token', { path: '/' })

        throw createError({
            statusCode: 401,
            statusMessage: 'Sesión inválida o expirada'
        })
    }
})
