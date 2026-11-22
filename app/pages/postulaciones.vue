<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

interface Opcion {
  id: number
  nombre: string
}

interface Candidato {
  id: number
  nombre_completo: string
}

interface Vacante {
  id: number
  titulo_puesto: string
  estado_vacante?: Opcion
}

interface Postulacion {
  id: number
  candidato_id: number
  vacante_id: number
  estado_postulacion_id: number
  fuente_reclutamiento_id: number
  fecha_postulacion?: string
  candidato?: Candidato
  vacante?: Vacante
  estado_postulacion?: Opcion
  fuente_reclutamiento?: Opcion
}

const { data: catalogos } = await useFetch<{
  candidatos: Candidato[]
  vacantes: Vacante[]
  estados: Opcion[]
  fuentes: Opcion[]
}>('/api/postulaciones/opciones')

const filtroVacante = ref<number | undefined>()
const filtroEstado = ref<number | undefined>()

const filtros = computed(() => ({
  ...(filtroVacante.value
      ? { vacante_id: filtroVacante.value }
      : {}),
  ...(filtroEstado.value
      ? { estado_postulacion_id: filtroEstado.value }
      : {})
}))

const {
  data: postulaciones,
  status,
  error: errorListado,
  refresh
} = await useFetch<Postulacion[]>('/api/postulaciones', {
  query: filtros,
  default: () => []
})

const opcionesCandidatos = computed(() =>
    catalogos.value?.candidatos.map(c => ({
      label: c.nombre_completo,
      value: c.id
    })) || []
)

const opcionesVacantes = computed(() =>
    catalogos.value?.vacantes
        .filter(v =>
            v.estado_vacante?.nombre?.toLowerCase() === 'abierta'
        )
        .map(v => ({
          label: v.titulo_puesto,
          value: v.id
        })) || []
)

const todasVacantes = computed(() =>
    catalogos.value?.vacantes.map(v => ({
      label: v.titulo_puesto,
      value: v.id
    })) || []
)

const opcionesEstados = computed(() =>
    catalogos.value?.estados.map(e => ({
      label: e.nombre,
      value: e.id
    })) || []
)

const opcionesFuentes = computed(() =>
    catalogos.value?.fuentes.map(f => ({
      label: f.nombre,
      value: f.id
    })) || []
)

const formularioAbierto = ref(false)
const guardando = ref(false)
const actualizandoId = ref<number | null>(null)
const mensaje = ref('')
const error = ref('')

const formulario = reactive({
  candidato_id: undefined as number | undefined,
  vacante_id: undefined as number | undefined,
  estado_postulacion_id: undefined as number | undefined,
  fuente_reclutamiento_id: undefined as number | undefined
})

function nuevaPostulacion() {
  formulario.candidato_id = undefined
  formulario.vacante_id = undefined
  formulario.estado_postulacion_id =
      catalogos.value?.estados.find(e =>
          e.nombre.toLowerCase() === 'recibida'
      )?.id
  formulario.fuente_reclutamiento_id = undefined

  mensaje.value = ''
  error.value = ''
  formularioAbierto.value = true
}

function obtenerMensajeError(e: any): string {
  const datos = e?.data?.data || e?.data

  if (datos?.errors) {
    return Object.values(datos.errors)
        .flat()
        .join(' ')
  }

  return datos?.message || 'Ocurrió un error.'
}

async function guardarPostulacion() {
  error.value = ''
  mensaje.value = ''

  if (
      !formulario.candidato_id ||
      !formulario.vacante_id ||
      !formulario.estado_postulacion_id ||
      !formulario.fuente_reclutamiento_id
  ) {
    error.value = 'Debes completar todos los campos.'
    return
  }

  guardando.value = true

  try {
    await $fetch('/api/postulaciones', {
      method: 'POST',
      body: { ...formulario }
    })

    formularioAbierto.value = false
    await refresh()

    mensaje.value = 'Postulación registrada correctamente.'
  } catch (e: any) {
    error.value = obtenerMensajeError(e)
  } finally {
    guardando.value = false
  }
}

async function cambiarEstado(
    postulacion: Postulacion,
    nuevoEstado: number
) {
  error.value = ''
  mensaje.value = ''
  actualizandoId.value = postulacion.id

  try {
    await $fetch(
        `/api/postulaciones/${postulacion.id}/estado`,
        {
          method: 'PATCH',
          body: {
            estado_postulacion_id: nuevoEstado
          }
        }
    )

    await refresh()
    mensaje.value = 'Estado actualizado correctamente.'
  } catch (e: any) {
    error.value = obtenerMensajeError(e)
  } finally {
    actualizandoId.value = null
  }
}


const generandoReporte = ref(false)

async function generarReporte() {
  generandoReporte.value = true
  error.value = ''

  try {
    // Actualizar los datos según los filtros seleccionados
    await refresh()

    if (errorListado.value) {
      throw new Error('No se pudieron consultar las postulaciones.')
    }

    const registros = postulaciones.value || []

    if (registros.length === 0) {
      error.value = 'No hay postulaciones para generar el reporte.'
      return
    }

    // Cargar ExcelJS solamente cuando se necesita
    const ExcelJS = await import('exceljs')

    const workbook = new ExcelJS.Workbook()
    const hoja = workbook.addWorksheet('Postulaciones')

    const vacanteSeleccionada = catalogos.value?.vacantes.find(
        v => v.id === filtroVacante.value
    )

    const estadoSeleccionado = catalogos.value?.estados.find(
        e => e.id === filtroEstado.value
    )

    // Encabezado
    hoja.mergeCells('A1:E1')
    hoja.getCell('A1').value =
        'SISTEMA DE RECLUTAMIENTO Y SELECCIÓN DE PERSONAL'

    hoja.mergeCells('A2:E2')
    hoja.getCell('A2').value = 'REPORTE DE POSTULACIONES'

    hoja.getCell('A4').value = 'Fecha de generación:'
    hoja.getCell('B4').value =
        new Date().toLocaleString('es-GT')

    hoja.getCell('A5').value = 'Vacante:'
    hoja.getCell('B5').value =
        vacanteSeleccionada?.titulo_puesto || 'Todas las vacantes'

    hoja.getCell('A6').value = 'Estado:'
    hoja.getCell('B6').value =
        estadoSeleccionado?.nombre || 'Todos los estados'

    hoja.getCell('A7').value = 'Total de postulaciones:'
    hoja.getCell('B7').value = registros.length

    // Encabezados de la tabla
    const encabezados = [
      'No.',
      'Candidato',
      'Vacante',
      'Fuente de reclutamiento',
      'Estado'
    ]

    const filaEncabezado = hoja.getRow(9)
    filaEncabezado.values = encabezados
    filaEncabezado.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }
    }

    filaEncabezado.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' }
    }

    filaEncabezado.alignment = {
      vertical: 'middle'
    }

    filaEncabezado.height = 25

    // Agregar postulaciones
    registros.forEach((postulacion, index) => {
      hoja.addRow([
        index + 1,
        postulacion.candidato?.nombre_completo || 'N/A',
        postulacion.vacante?.titulo_puesto || 'N/A',
        postulacion.fuente_reclutamiento?.nombre || 'N/A',
        postulacion.estado_postulacion?.nombre || 'N/A'
      ])
    })

    // Ancho de columnas
    hoja.getColumn(1).width = 10
    hoja.getColumn(2).width = 35
    hoja.getColumn(3).width = 40
    hoja.getColumn(4).width = 28
    hoja.getColumn(5).width = 22

    // Formato de títulos
    hoja.getCell('A1').font = {
      bold: true,
      size: 15,
      color: { argb: 'FF1E3A5F' }
    }

    hoja.getCell('A2').font = {
      bold: true,
      size: 12
    }

    // Bordes de la tabla
    for (let fila = 9; fila <= 9 + registros.length; fila++) {
      for (let columna = 1; columna <= 5; columna++) {
        hoja.getCell(fila, columna).border = {
          bottom: {
            style: 'thin',
            color: { argb: 'FFE5E7EB' }
          }
        }
      }
    }

    hoja.autoFilter = {
      from: 'A9',
      to: `E${9 + registros.length}`
    }

    // Generar archivo Excel
    const buffer = await workbook.xlsx.writeBuffer()

    const archivo = new Blob(
        [new Uint8Array(buffer)],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    )

    // Descargar archivo automáticamente
    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    const fecha = new Date().toISOString().slice(0, 10)

    enlace.href = url
    enlace.download = `Reporte_Postulaciones_${fecha}.xlsx`

    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    setTimeout(() => URL.revokeObjectURL(url), 1000)

  } catch (e) {
    console.error('Error al generar el reporte:', e)
    error.value = 'No se pudo generar el archivo Excel.'
  } finally {
    generandoReporte.value = false
  }
}

</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold">Postulaciones</h1>
        <p class="text-gray-500">
          Registro y seguimiento de candidatos por vacante.
        </p>
      </div>

      <UButton
          icon="i-lucide-plus"
          @click="nuevaPostulacion"
      >
        Nueva postulación
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
        title="No se pudieron cargar las postulaciones."
    />

    <!-- Crear postulación -->
    <UCard v-if="formularioAbierto">
      <template #header>
        <h2 class="font-semibold">Registrar postulación</h2>
      </template>

      <form class="space-y-4" @submit.prevent="guardarPostulacion">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Candidato" required>
            <USelect
                v-model="formulario.candidato_id"
                :items="opcionesCandidatos"
                placeholder="Selecciona un candidato"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Vacante" required>
            <USelect
                v-model="formulario.vacante_id"
                :items="opcionesVacantes"
                placeholder="Selecciona una vacante"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Estado" required>
            <USelect
                v-model="formulario.estado_postulacion_id"
                :items="opcionesEstados"
                placeholder="Selecciona un estado"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Fuente de reclutamiento" required>
            <USelect
                v-model="formulario.fuente_reclutamiento_id"
                :items="opcionesFuentes"
                placeholder="Selecciona una fuente"
                class="w-full"
            />
          </UFormField>
        </div>

        <div class="flex justify-end gap-3">
          <UButton
              type="button"
              color="neutral"
              variant="outline"
              @click="formularioAbierto = false"
          >
            Cancelar
          </UButton>

          <UButton
              type="submit"
              icon="i-lucide-save"
              :loading="guardando"
          >
            Guardar postulación
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Filtros -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">Filtrar postulaciones</h2>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UFormField label="Vacante">
          <USelect
              v-model="filtroVacante"
              :items="todasVacantes"
              placeholder="Todas las vacantes"
              class="w-full"
          />
        </UFormField>

        <UFormField label="Estado">
          <USelect
              v-model="filtroEstado"
              :items="opcionesEstados"
              placeholder="Todos los estados"
              class="w-full"
          />
        </UFormField>

        <div class="flex flex-wrap items-end gap-3">
          <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-rotate-ccw"
              @click="filtroVacante = undefined; filtroEstado = undefined"
          >
            Limpiar filtros
          </UButton>

          <UButton
              color="success"
              icon="i-lucide-file-spreadsheet"
              :loading="generandoReporte"
              :disabled="status === 'pending'"
              @click="generarReporte"
          >
            Generar reporte Excel
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Listado -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">Postulaciones registradas</h2>
          <UBadge color="neutral" variant="soft">
            {{ postulaciones?.length || 0 }} registros
          </UBadge>
        </div>
      </template>

      <div v-if="status === 'pending'" class="py-10 text-center">
        Cargando postulaciones...
      </div>

      <div
          v-else-if="!postulaciones?.length"
          class="py-10 text-center text-gray-500"
      >
        No se encontraron postulaciones.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
          <tr class="border-b border-gray-200 dark:border-gray-800 text-left">
            <th class="p-3">ID</th>
            <th class="p-3">Candidato</th>
            <th class="p-3">Vacante</th>
            <th class="p-3">Fuente</th>
            <th class="p-3">Estado</th>
          </tr>
          </thead>

          <tbody>
          <tr
              v-for="postulacion in postulaciones"
              :key="postulacion.id"
              class="border-b border-gray-100 dark:border-gray-800"
          >
            <td class="p-3">{{ postulacion.id }}</td>

            <td class="p-3">
              {{ postulacion.candidato?.nombre_completo || 'N/A' }}
            </td>

            <td class="p-3">
              {{ postulacion.vacante?.titulo_puesto || 'N/A' }}
            </td>

            <td class="p-3">
              {{ postulacion.fuente_reclutamiento?.nombre || 'N/A' }}
            </td>

            <td class="p-3 min-w-44">
              <USelect
                  :model-value="postulacion.estado_postulacion_id"
                  :items="opcionesEstados"
                  :loading="actualizandoId === postulacion.id"
                  :disabled="actualizandoId !== null"
                  class="w-full"
                  @update:model-value="
                    valor => cambiarEstado(postulacion, Number(valor))
                  "
              />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
