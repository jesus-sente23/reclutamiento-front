<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

interface Catalogo {
  id: number
  nombre: string
}

interface Vacante {
  id: number
  titulo_puesto: string
  descripcion_puesto: string
  salario_minimo: number | string
  salario_maximo: number | string
  ubicacion: string
  unidad_id: number
  modalidad_trabajo_id: number
  estado_vacante_id: number
  unidad?: Catalogo
  modalidad_trabajo?: Catalogo
  estado_vacante?: Catalogo
}

const { data: vacantes, status, error: errorListado, refresh } =
    await useFetch<Vacante[]>('/api/vacantes', {
      default: () => []
    })

const { data: catalogos, error: errorCatalogos } = await useFetch<{
  unidades: Catalogo[]
  modalidades: Catalogo[]
  estados: Catalogo[]
}>('/api/vacantes/opciones')

const opcionesUnidades = computed(() =>
    catalogos.value?.unidades.map(u => ({
      label: u.nombre,
      value: String(u.id)
    })) || []
)

const opcionesModalidades = computed(() =>
    catalogos.value?.modalidades.map(m => ({
      label: m.nombre,
      value: String(m.id)
    })) || []
)

const opcionesEstados = computed(() =>
    catalogos.value?.estados.map(e => ({
      label: e.nombre,
      value: String(e.id)
    })) || []
)

const formularioAbierto = ref(false)
const editandoId = ref<number | null>(null)
const guardando = ref(false)
const eliminandoId = ref<number | null>(null)
const mensaje = ref('')
const error = ref('')

const formulario = reactive({
  titulo_puesto: '',
  descripcion_puesto: '',
  salario_minimo: 0,
  salario_maximo: 0,
  ubicacion: '',
  unidad_id: undefined as string | undefined,
  modalidad_trabajo_id: undefined as string | undefined,
  estado_vacante_id: undefined as string | undefined
})

function limpiarFormulario() {
  formulario.titulo_puesto = ''
  formulario.descripcion_puesto = ''
  formulario.salario_minimo = 0
  formulario.salario_maximo = 0
  formulario.ubicacion = ''
  formulario.unidad_id = undefined
  formulario.modalidad_trabajo_id = undefined
  formulario.estado_vacante_id = undefined
  editandoId.value = null
}

function nuevaVacante() {
  limpiarFormulario()
  mensaje.value = ''
  error.value = ''
  formularioAbierto.value = true
}

function editarVacante(vacante: Vacante) {
  editandoId.value = vacante.id
  formulario.titulo_puesto = vacante.titulo_puesto
  formulario.descripcion_puesto = vacante.descripcion_puesto
  formulario.salario_minimo = Number(vacante.salario_minimo)
  formulario.salario_maximo = Number(vacante.salario_maximo)
  formulario.ubicacion = vacante.ubicacion
  formulario.unidad_id = String(vacante.unidad_id)
  formulario.modalidad_trabajo_id = String(vacante.modalidad_trabajo_id)
  formulario.estado_vacante_id = String(vacante.estado_vacante_id)

  mensaje.value = ''
  error.value = ''
  formularioAbierto.value = true
}

function cancelar() {
  formularioAbierto.value = false
  limpiarFormulario()
}

async function guardarVacante() {
  error.value = ''
  mensaje.value = ''
  guardando.value = true

  try {
    const editando = editandoId.value !== null

    await $fetch(
        editando
            ? `/api/vacantes/${editandoId.value}`
            : '/api/vacantes',
        {
          method: editando ? 'PUT' : 'POST',
          body: {
            ...formulario,
            unidad_id: Number(formulario.unidad_id),
            modalidad_trabajo_id: Number(formulario.modalidad_trabajo_id),
            estado_vacante_id: Number(formulario.estado_vacante_id)
          }
        }
    )

    cancelar()
    await refresh()

    mensaje.value = editando
        ? 'Vacante actualizada correctamente.'
        : 'Vacante registrada correctamente.'
  } catch (e: any) {
    error.value =
        e.data?.data?.message ||
        e.data?.message ||
        'No se pudo guardar la vacante.'
  } finally {
    guardando.value = false
  }
}

async function eliminarVacante(vacante: Vacante) {
  if (!window.confirm(
      `¿Deseas eliminar la vacante "${vacante.titulo_puesto}"?`
  )) return

  error.value = ''
  mensaje.value = ''
  eliminandoId.value = vacante.id

  try {
    await $fetch(`/api/vacantes/${vacante.id}`, {
      method: 'DELETE'
    })

    await refresh()
    mensaje.value = 'Vacante eliminada correctamente.'
  } catch (e: any) {
    error.value =
        e.data?.data?.message ||
        e.data?.message ||
        'No se pudo eliminar la vacante.'
  } finally {
    eliminandoId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold">Vacantes</h1>
        <p class="text-gray-500">
          Administración de las vacantes disponibles.
        </p>
      </div>

      <UButton
          icon="i-lucide-plus"
          @click="nuevaVacante"
      >
        Nueva vacante
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
        title="No se pudieron cargar las vacantes."
    />

    <UAlert
        v-if="errorCatalogos"
        color="error"
        title="No se pudieron cargar las unidades, modalidades o estados."
    />

    <UCard v-if="formularioAbierto">
      <template #header>
        <h2 class="font-semibold">
          {{ editandoId !== null ? 'Editar vacante' : 'Nueva vacante' }}
        </h2>
      </template>

      <form class="space-y-4" @submit.prevent="guardarVacante">
        <UFormField label="Título del puesto" required>
          <UInput
              v-model="formulario.titulo_puesto"
              class="w-full"
              maxlength="100"
              required
          />
        </UFormField>

        <UFormField label="Descripción" required>
          <UTextarea
              v-model="formulario.descripcion_puesto"
              class="w-full"
              :rows="3"
              maxlength="500"
              required
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Salario mínimo" required>
            <UInput
                v-model.number="formulario.salario_minimo"
                type="number"
                min="0"
                step="0.01"
                class="w-full"
                required
            />
          </UFormField>

          <UFormField label="Salario máximo" required>
            <UInput
                v-model.number="formulario.salario_maximo"
                type="number"
                min="0"
                step="0.01"
                class="w-full"
                required
            />
          </UFormField>
        </div>

        <UFormField label="Ubicación" required>
          <UInput
              v-model="formulario.ubicacion"
              class="w-full"
              maxlength="255"
              required
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormField label="Unidad" required>
            <USelect
                v-model="formulario.unidad_id"
                :items="opcionesUnidades"
                placeholder="Seleccione"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Modalidad" required>
            <USelect
                v-model="formulario.modalidad_trabajo_id"
                :items="opcionesModalidades"
                placeholder="Seleccione"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Estado" required>
            <USelect
                v-model="formulario.estado_vacante_id"
                :items="opcionesEstados"
                placeholder="Seleccione"
                class="w-full"
            />
          </UFormField>
        </div>

        <div class="flex justify-end gap-3 pt-3">
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
            Guardar vacante
          </UButton>
        </div>
      </form>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">Vacantes registradas</h2>
          <UBadge color="neutral" variant="soft">
            {{ vacantes?.length || 0 }} registros
          </UBadge>
        </div>
      </template>

      <div v-if="status === 'pending'" class="p-6 text-center">
        Cargando vacantes...
      </div>

      <div v-else-if="!vacantes?.length" class="p-6 text-center text-gray-500">
        No hay vacantes registradas.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800 text-left">
            <th class="p-3">Puesto</th>
            <th class="p-3">Unidad</th>
            <th class="p-3">Modalidad</th>
            <th class="p-3">Salario</th>
            <th class="p-3">Estado</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
          </thead>

          <tbody>
          <tr
              v-for="vacante in vacantes"
              :key="vacante.id"
              class="border-b border-gray-100 dark:border-gray-800"
          >
            <td class="p-3 font-medium">
              {{ vacante.titulo_puesto }}
            </td>

            <td class="p-3">
              {{ vacante.unidad?.nombre || 'N/A' }}
            </td>

            <td class="p-3">
              {{ vacante.modalidad_trabajo?.nombre || 'N/A' }}
            </td>

            <td class="p-3">
              Q{{ vacante.salario_minimo }} -
              Q{{ vacante.salario_maximo }}
            </td>

            <td class="p-3">
              <UBadge
                  :color="vacante.estado_vacante?.nombre?.toLowerCase() === 'abierta'
                    ? 'success'
                    : 'neutral'"
                  variant="subtle"
              >
                {{ vacante.estado_vacante?.nombre || 'N/A' }}
              </UBadge>
            </td>

            <td class="p-3">
              <div class="flex justify-end gap-2">
                <UButton
                    icon="i-lucide-pencil"
                    variant="outline"
                    size="sm"
                    @click="editarVacante(vacante)"
                >
                  Editar
                </UButton>

                <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="outline"
                    size="sm"
                    :loading="eliminandoId === vacante.id"
                    @click="eliminarVacante(vacante)"
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
