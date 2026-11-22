import { candidatosApi } from '../../utils/candidatosApi'

export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id')

    if (!id || !/^\d+$/.test(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID inválido'
        })
    }

    return candidatosApi(event, `/candidatos/${id}`, 'DELETE')
})