import { vacantesApi } from '../../utils/vacantesApi'

export default defineEventHandler((event) => {
    return vacantesApi(event, '/entrevistas', 'POST')
})
