export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    try {
        const respuesta = await $fetch<{
            success: boolean
            token: string
            user: {
                id: number
                name: string
                email: string
            }
        }>(`${config.laravelApiUrl}/login`, {
            method: 'POST',
            body: {
                email: body.email,
                password: body.password
            },
            headers: {
                Accept: 'application/json'
            }
        })

        setCookie(event, 'auth_token', respuesta.token, {
            httpOnly: true,
            secure: !import.meta.dev,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 8
        })

        return {
            success: true,
            message: 'Inicio de sesión exitoso',
            user: respuesta.user
        }
    } catch (error: any) {
        throw createError({
            statusCode: error.response?.status || 401,
            statusMessage: 'No se pudo iniciar sesión',
            message: 'Correo o contraseña incorrectos'
        })
    }
})
