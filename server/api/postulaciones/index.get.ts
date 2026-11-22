import { vacantesApi } from '../../utils/vacantesApi'

export default defineEventHandler((event) => {
    const query = getQuery(event)
    const params = new URLSearchParams()

    if (query.vacante_id) {
        params.set('vacante_id', String(query.vacante_id))
    }

    if (query.estado_postulacion_id) {
        params.set(
            'estado_postulacion_id',
            String(query.estado_postulacion_id)
        )
    }

    const filtros = params.toString()
    const path = filtros
        ? `/postulaciones?${filtros}`
        : '/postulaciones'

    return vacantesApi(event, path, 'GET')
})
