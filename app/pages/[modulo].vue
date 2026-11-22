<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()

const nombres: Record<string, string> = {
  unidades: 'Unidades',
  vacantes: 'Vacantes',
  candidatos: 'Candidatos',
  postulaciones: 'Postulaciones',
  entrevistas: 'Entrevistas',
  reportes: 'Reportes'
}

const modulo = computed(() => String(route.params.modulo))
const titulo = computed(() => nombres[modulo.value])

if (!titulo.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Página no encontrada'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        {{ titulo }}
      </h1>

      <p class="text-gray-500 mt-1">
        Administración del módulo de {{ titulo.toLowerCase() }}.
      </p>
    </div>

    <UCard>
      <div class="py-12 flex flex-col items-center text-center gap-3">
        <UIcon
            name="i-lucide-construction"
            class="text-5xl text-gray-400"
        />

        <h2 class="text-lg font-semibold">
          Módulo en preparación
        </h2>

        <p class="text-gray-500 text-sm">
          Aquí implementaremos las funcionalidades de {{ titulo }}.
        </p>

        <UButton
            to="/dashboard"
            variant="outline"
            icon="i-lucide-arrow-left"
            class="mt-3"
        >
          Regresar al dashboard
        </UButton>
      </div>
    </UCard>
  </div>
</template>
