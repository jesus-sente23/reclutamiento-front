import { vacantesApi } from '../../utils/vacantesApi'

export default defineEventHandler((event) =>
    vacantesApi(event, '/vacantes', 'POST')
)
