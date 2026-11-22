import type { H3Event } from 'h3'

export async function vacantesApi(
    event: H3Event,
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET'
) {
    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No autenticado'
        })
    }

    if (method !== 'GET') {
        const origin = getHeader(event, 'origin')
        const host = getHeader(event, 'host')

        let mismoOrigen = false

        try {
            mismoOrigen = Boolean(
                origin && host && new URL(origin).host === host
            )
        } catch {
            mismoOrigen = false
        }

        if (!mismoOrigen) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Origen no permitido'
            })
        }
    }

    const config = useRuntimeConfig(event)

    try {
        return await $fetch(
            `${config.laravelApiUrl}${path}`,
            {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                },
                ...(method === 'POST' || method === 'PUT' || method === 'PATCH'
                    ? { body: await readBody(event) }
                    : {})
            }
        )
    } catch (error: any) {
        throw createError({
            statusCode: error?.response?.status || 502,
            statusMessage: 'Error al consultar Laravel',
            data: error?.data
        })
    }
}
