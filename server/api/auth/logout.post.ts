export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    const config = useRuntimeConfig()

    try {
        if (token) {
            await $fetch(`${config.laravelApiUrl}/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            })
        }
    } finally {
        deleteCookie(event, 'auth_token', { path: '/' })
    }

    return {
        success: true,
        message: 'Sesión cerrada'
    }
})
