import { candidatosApi } from '../../utils/candidatosApi'

export default defineEventHandler((event) =>
    candidatosApi(event, '/candidatos', 'POST')
)