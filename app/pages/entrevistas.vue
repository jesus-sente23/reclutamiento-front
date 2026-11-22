<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

interface Catalogo {
  id: number
  nombre: string
}

interface Usuario {
  id: number
  name: string
  email: string
}

interface Candidato {
  id: number
  nombre_completo: string
}

interface Vacante {
  id: number
  titulo_puesto: string
}

interface Postulacion {
  id: number
  candidato?: Candidato
  vacante?: Vacante
}

interface Entrevista {
  id: number
  fecha_hora: string
  postulacion_id: number
  entrevistador_id: number
  tipo_entrevista_id: number
  resultado_entrevista_id: number
  observaciones: string | null
  postulacion?: Postulacion
  entrevistador?: Usuario
  tipo_entrevista?: Catalogo
  resultado_entrevista?: Catalogo
}

interface Opciones {
  postulaciones: Postulacion[]
  entrevistadores: Usuario[]
  tipos: Catalogo[]
  resultados: Catalogo[]
}

const {
  data: entrevistas,
  status,
  error: errorListado,
  refresh
} = await useFetch<Entrevista[]>('/api/entrevistas', {
  default: () => []
})

const {
  data: catalogos,
  error: errorCatalogos
} = await useFetch<Opciones>('/api/entrevistas/opciones')

const opcionesPostulaciones = computed(() =>
    catalogos.value?.postulaciones.map(p => ({
      label: `${p.candidato?.nombre_completo || 'Candidato'} - ${p.vacante?.titulo_puesto || 'Vacante'} (#${p.id})`,
      value: String(p.id)
    })) || []
)

const opcionesEntrevistadores = computed(() =>
    catalogos.value?.entrevistadores.map(u => ({
      label: u.name,
      value: String(u.id)
    })) || []
)

const opcionesTipos = computed(() =>
    catalogos.value?.tipos.map(t => ({
      label: t.nombre,
      value: String(t.id)
    })) || []
)

const opcionesResultados = computed(() =>
    catalogos.value?.resultados.map(r => ({
      label: r.nombre,
      value: String(r.id)
    })) || []
)

const formularioAbierto = ref(false)
const editandoId = ref<number | null>(null)
const guardando = ref(false)
const eliminandoId = ref<number | null>(null)

const mensaje = ref('')
const error = ref('')

const formulario = reactive({
  fecha_hora: '',
  postulacion_id: undefined as string | undefined,
  entrevistador_id: undefined as string | undefined,
  tipo_entrevista_id: undefined as string | undefined,
  resultado_entrevista_id: undefined as string | undefined,
  observaciones: ''
})

function limpiarFormulario() {
  formulario.fecha_hora = ''
  formulario.postulacion_id = undefined
  formulario.entrevistador_id = undefined
  formulario.tipo_entrevista_id = undefined
  formulario.resultado_entrevista_id = undefined
  formulario.observaciones = ''
  editandoId.value = null
}

function nuevaEntrevista() {
  limpiarFormulario()

  const resultadoPendiente = catalogos.value?.resultados.find(
      r => r.nombre.toLowerCase() === 'pendiente'
  )

  formulario.resultado_entrevista_id =
      resultadoPendiente ? String(resultadoPendiente.id) : undefined

  error.value = ''
  mensaje.value = ''
  formularioAbierto.value = true
}

function editarEntrevista(entrevista: Entrevista) {
  editandoId.value = entrevista.id
  formulario.fecha_hora =
      entrevista.fecha_hora.replace(' ', 'T').substring(0, 16)
  formulario.postulacion_id = String(entrevista.postulacion_id)
  formulario.entrevistador_id = String(entrevista.entrevistador_id)
  formulario.tipo_entrevista_id = String(entrevista.tipo_entrevista_id)
  formulario.resultado_entrevista_id = String(entrevista.resultado_entrevista_id)
  formulario.observaciones = entrevista.observaciones || ''

  error.value = ''
  mensaje.value = ''
  formularioAbierto.value = true
}

function cancelar() {
  limpiarFormulario()
  formularioAbierto.value = false
  error.value = ''
}

function obtenerError(e: any): string {
  const datos = e?.data?.data || e?.data

  if (datos?.errors) {
    return Object.values(datos.errors)
        .flat()
        .join(' ')
  }

  return datos?.message || 'Ocurrió un error.'
}

async function guardarEntrevista() {
  error.value = ''
  mensaje.value = ''

  if (
      !formulario.fecha_hora ||
      !formulario.postulacion_id ||
      !formulario.entrevistador_id ||
      !formulario.tipo_entrevista_id ||
      !formulario.resultado_entrevista_id
  ) {
    error.value = 'Completa todos los campos obligatorios.'
    return
  }

  guardando.value = true

  try {
    const editando = editandoId.value !== null

    await $fetch(
        editando
            ? `/api/entrevistas/${editandoId.value}`
            : '/api/entrevistas',
        {
          method: editando ? 'PUT' : 'POST',
          body: {
            ...formulario,
            fecha_hora: formulario.fecha_hora.replace('T', ' '),
            postulacion_id: Number(formulario.postulacion_id),
            entrevistador_id: Number(formulario.entrevistador_id),
            tipo_entrevista_id: Number(formulario.tipo_entrevista_id),
            resultado_entrevista_id: Number(formulario.resultado_entrevista_id)
          }
        }
    )

    cancelar()
    await refresh()

    mensaje.value = editando
        ? 'Entrevista actualizada correctamente.'
        : 'Entrevista registrada correctamente.'
  } catch (e: any) {
    error.value = obtenerError(e)
  } finally {
    guardando.value = false
  }
}

async function eliminarEntrevista(entrevista: Entrevista) {
  if (!window.confirm(
      `¿Deseas eliminar la entrevista #${entrevista.id}?`
  )) return

  eliminandoId.value = entrevista.id
  error.value = ''
  mensaje.value = ''

  try {
    await $fetch(`/api/entrevistas/${entrevista.id}`, {
      method: 'DELETE'
    })

    await refresh()
    mensaje.value = 'Entrevista eliminada correctamente.'
  } catch (e: any) {
    error.value = obtenerError(e)
  } finally {
    eliminandoId.value = null
  }
}

function fechaLegible(fecha: string): string {
  const valor = fecha.replace('T', ' ')
  return valor.substring(0, 16)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold">Entrevistas</h1>
        <p class="text-gray-500 mt-1">
          Programación y seguimiento de entrevistas.
        </p>
      </div>

      <UButton
          icon="i-lucide-plus"
          @click="nuevaEntrevista"
      >
        Nueva entrevista
      </UButton>
    </div>

    <UAlert
        v-if="mensaje"
        color="success"
        :title="mensaje"
    />

    <UAlert
        v-if="error"
        color="error"
        :title="error"
    />

    <UAlert
        v-if="errorListado"
        color="error"
        title="No se pudieron cargar las entrevistas."
    />

    <UAlert
        v-if="errorCatalogos"
        color="error"
        title="No se pudieron cargar las opciones del formulario."
    />

    <!-- Formulario -->
    <UCard v-if="formularioAbierto">
      <template #header>
        <h2 class="font-semibold">
          {{ editandoId !== null
            ? 'Editar entrevista'
            : 'Programar entrevista' }}
        </h2>
      </template>

      <form
          class="space-y-4"
          @submit.prevent="guardarEntrevista"
      >
        <UFormField label="Postulación" required>
          <USelect
              v-model="formulario.postulacion_id"
              :items="opcionesPostulaciones"
              placeholder="Selecciona una postulación"
              class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Fecha y hora" required>
            <UInput
                v-model="formulario.fecha_hora"
                type="datetime-local"
                class="w-full"
                required
            />
          </UFormField>

          <UFormField label="Entrevistador" required>
            <USelect
                v-model="formulario.entrevistador_id"
                :items="opcionesEntrevistadores"
                placeholder="Selecciona un usuario"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Tipo de entrevista" required>
            <USelect
                v-model="formulario.tipo_entrevista_id"
                :items="opcionesTipos"
                placeholder="Selecciona un tipo"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Resultado" required>
            <USelect
                v-model="formulario.resultado_entrevista_id"
                :items="opcionesResultados"
                placeholder="Selecciona un resultado"
                class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Observaciones">
          <UTextarea
              v-model="formulario.observaciones"
              placeholder="Agrega comentarios sobre la entrevista..."
              :rows="4"
              class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-3">
          <UButton
              color="neutral"
              variant="outline"
              type="button"
              @click="cancelar"
          >
            Cancelar
          </UButton>

          <UButton
              type="submit"
              icon="i-lucide-save"
              :loading="guardando"
          >
            Guardar entrevista
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Listado -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            Entrevistas registradas
          </h2>

          <UBadge color="neutral" variant="soft">
            {{ entrevistas?.length || 0 }} registros
          </UBadge>
        </div>
      </template>

      <div
          v-if="status === 'pending'"
          class="py-10 text-center"
      >
        Cargando entrevistas...
      </div>

      <div
          v-else-if="!entrevistas?.length"
          class="py-10 text-center text-gray-500"
      >
        No hay entrevistas registradas.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800 text-left">
            <th class="p-3">Fecha y hora</th>
            <th class="p-3">Candidato</th>
            <th class="p-3">Vacante</th>
            <th class="p-3">Entrevistador</th>
            <th class="p-3">Tipo</th>
            <th class="p-3">Resultado</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
          </thead>

          <tbody>
          <tr
              v-for="entrevista in entrevistas"
              :key="entrevista.id"
              class="border-b border-gray-100 dark:border-gray-800"
          >
            <td class="p-3 whitespace-nowrap">
              {{ fechaLegible(entrevista.fecha_hora) }}
            </td>

            <td class="p-3">
              {{ entrevista.postulacion?.candidato?.nombre_completo || 'N/A' }}
            </td>

            <td class="p-3">
              {{ entrevista.postulacion?.vacante?.titulo_puesto || 'N/A' }}
            </td>

            <td class="p-3">
              {{ entrevista.entrevistador?.name || 'N/A' }}
            </td>

            <td class="p-3">
              {{ entrevista.tipo_entrevista?.nombre || 'N/A' }}
            </td>

            <td class="p-3">
              <UBadge
                  :color="
                    entrevista.resultado_entrevista?.nombre === 'Aprobado'
                      ? 'success'
                      : entrevista.resultado_entrevista?.nombre === 'No aprobado'
                        ? 'error'
                        : 'warning'
                  "
                  variant="subtle"
              >
                {{ entrevista.resultado_entrevista?.nombre || 'N/A' }}
              </UBadge>
            </td>

            <td class="p-3">
              <div class="flex justify-end gap-2">
                <UButton
                    icon="i-lucide-pencil"
                    variant="outline"
                    size="sm"
                    @click="editarEntrevista(entrevista)"
                >
                  Editar
                </UButton>

                <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="outline"
                    size="sm"
                    :loading="eliminandoId === entrevista.id"
                    @click="eliminarEntrevista(entrevista)"
                >
                  Eliminar
                </UButton>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
