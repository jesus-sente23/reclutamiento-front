import { vacantesApi } from '../../utils/vacantesApi'

export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id')

    if (!id || !/^\d+$/.test(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID de entrevista inválido'
        })
    }

    return vacantesApi(
        event,
        `/entrevistas/${id}`,
        'DELETE'
    )
})
