<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

interface Candidato {
  id: number
  nombre_completo: string
  correo_electronico: string
  telefono: string
  fecha_nacimiento: string
  expectativa_salarial: string | number
}

const { data: candidatos, status, error: errorListado, refresh } =
    await useFetch<Candidato[]>('/api/candidatos', {
      default: () => []
    })

const formularioAbierto = ref(false)
const editandoId = ref<number | null>(null)
const guardando = ref(false)
const eliminandoId = ref<number | null>(null)

const mensaje = ref('')
const error = ref('')

const formulario = reactive({
  nombre_completo: '',
  correo_electronico: '',
  telefono: '',
  fecha_nacimiento: '',
  expectativa_salarial: 0
})

const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ'
})

function limpiarFormulario() {
  formulario.nombre_completo = ''
  formulario.correo_electronico = ''
  formulario.telefono = ''
  formulario.fecha_nacimiento = ''
  formulario.expectativa_salarial = 0
  editandoId.value = null
}

function nuevoCandidato() {
  limpiarFormulario()
  error.value = ''
  mensaje.value = ''
  formularioAbierto.value = true
}

function editarCandidato(candidato: Candidato) {
  editandoId.value = candidato.id
  formulario.nombre_completo = candidato.nombre_completo
  formulario.correo_electronico = candidato.correo_electronico
  formulario.telefono = candidato.telefono
  formulario.fecha_nacimiento =
      candidato.fecha_nacimiento?.substring(0, 10) || ''
  formulario.expectativa_salarial =
      Number(candidato.expectativa_salarial)

  error.value = ''
  mensaje.value = ''
  formularioAbierto.value = true
}

function cancelar() {
  formularioAbierto.value = false
  limpiarFormulario()
  error.value = ''
}

async function guardarCandidato() {
  error.value = ''
  mensaje.value = ''
  guardando.value = true

  try {
    const editando = editandoId.value !== null

    await $fetch(
        editando
            ? `/api/candidatos/${editandoId.value}`
            : '/api/candidatos',
        {
          method: editando ? 'PUT' : 'POST',
          body: { ...formulario }
        }
    )

    cancelar()
    await refresh()

    mensaje.value = editando
        ? 'Candidato actualizado correctamente.'
        : 'Candidato registrado correctamente.'
  } catch (e: any) {
    const erroresLaravel = e.data?.data?.errors

    if (erroresLaravel) {
      error.value = Object.values(erroresLaravel)
          .flat()
          .join(' ')
    } else {
      error.value =
          e.data?.data?.message ||
          e.data?.message ||
          'No se pudo guardar el candidato.'
    }
  } finally {
    guardando.value = false
  }
}

async function eliminarCandidato(candidato: Candidato) {
  if (!window.confirm(
      `¿Deseas eliminar a "${candidato.nombre_completo}"?`
  )) return

  eliminandoId.value = candidato.id
  error.value = ''
  mensaje.value = ''

  try {
    await $fetch(`/api/candidatos/${candidato.id}`, {
      method: 'DELETE'
    })

    await refresh()
    mensaje.value = 'Candidato eliminado correctamente.'
  } catch (e: any) {
    error.value =
        e.data?.data?.message ||
        e.data?.message ||
        'No se pudo eliminar el candidato.'
  } finally {
    eliminandoId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          Candidatos
        </h1>
        <p class="text-gray-500 mt-1">
          Registro y administración de candidatos.
        </p>
      </div>

      <UButton
          icon="i-lucide-plus"
          @click="nuevoCandidato"
      >
        Nuevo candidato
      </UButton>
    </div>

    <UAlert
        v-if="mensaje"
        color="success"
        icon="i-lucide-circle-check"
        :title="mensaje"
    />

    <UAlert
        v-if="error"
        color="error"
        icon="i-lucide-circle-alert"
        :title="error"
    />

    <UAlert
        v-if="errorListado"
        color="error"
        title="No se pudieron cargar los candidatos."
    />

    <UCard v-if="formularioAbierto">
      <template #header>
        <h2 class="font-semibold">
          {{ editandoId !== null
            ? 'Editar candidato'
            : 'Registrar candidato' }}
        </h2>
      </template>

      <form
          class="space-y-4"
          @submit.prevent="guardarCandidato"
      >
        <UFormField label="Nombre completo" required>
          <UInput
              v-model="formulario.nombre_completo"
              placeholder="Nombre y apellidos"
              maxlength="200"
              class="w-full"
              required
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Correo electrónico" required>
            <UInput
                v-model="formulario.correo_electronico"
                type="email"
                placeholder="correo@ejemplo.com"
                maxlength="255"
                class="w-full"
                required
            />
          </UFormField>

          <UFormField label="Teléfono" required>
            <UInput
                v-model="formulario.telefono"
                type="tel"
                placeholder="5555-5555"
                maxlength="25"
                class="w-full"
                required
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Fecha de nacimiento" required>
            <UInput
                v-model="formulario.fecha_nacimiento"
                type="date"
                class="w-full"
                required
            />
          </UFormField>

          <UFormField label="Expectativa salarial (Q)" required>
            <UInput
                v-model.number="formulario.expectativa_salarial"
                type="number"
                min="0"
                step="0.01"
                class="w-full"
                required
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
            Guardar candidato
          </UButton>
        </div>
      </form>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold">
            Candidatos registrados
          </h2>

          <UBadge color="neutral" variant="soft">
            {{ candidatos?.length || 0 }} registros
          </UBadge>
        </div>
      </template>

      <div v-if="status === 'pending'" class="py-10 text-center">
        Cargando candidatos...
      </div>

      <div
          v-else-if="!candidatos?.length"
          class="py-10 text-center text-gray-500"
      >
        No hay candidatos registrados.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-gray-200 dark:border-gray-800">
          <tr class="text-left">
            <th class="px-4 py-3">Nombre</th>
            <th class="px-4 py-3">Correo</th>
            <th class="px-4 py-3">Teléfono</th>
            <th class="px-4 py-3">Expectativa salarial</th>
            <th class="px-4 py-3 text-right">Acciones</th>
          </tr>
          </thead>

          <tbody>
          <tr
              v-for="candidato in candidatos"
              :key="candidato.id"
              class="border-b border-gray-100 dark:border-gray-800"
          >
            <td class="px-4 py-3 font-medium">
              {{ candidato.nombre_completo }}
            </td>

            <td class="px-4 py-3">
              {{ candidato.correo_electronico }}
            </td>

            <td class="px-4 py-3">
              {{ candidato.telefono }}
            </td>

            <td class="px-4 py-3">
              {{ formatoMoneda.format(
                Number(candidato.expectativa_salarial)
            ) }}
            </td>

            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <UButton
                    icon="i-lucide-pencil"
                    color="primary"
                    variant="outline"
                    size="sm"
                    @click="editarCandidato(candidato)"
                >
                  Editar
                </UButton>

                <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="outline"
                    size="sm"
                    :loading="eliminandoId === candidato.id"
                    @click="eliminarCandidato(candidato)"
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
