export default defineEventHandler(async () => {
    const config = useRuntimeConfig()

    const url = `${config.laravelApiUrl}/conexion`

    console.log('Consultando Laravel:', url)

    try {
        const respuesta = await $fetch(url)

        console.log('Respuesta de Laravel:', respuesta)

        return respuesta
    } catch (error) {
        console.error('ERROR REAL DE CONEXIÓN:', error)

        throw createError({
            statusCode: 502,
            statusMessage: 'No se pudo conectar con Laravel'
        })
    }
})
