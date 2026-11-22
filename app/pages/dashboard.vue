
<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const modulos = [
  {
    titulo: 'Unidades',
    descripcion: 'Organización de los departamentos',
    icono: 'i-lucide-building-2',
    ruta: '/unidades'
  },
  {
    titulo: 'Vacantes',
    descripcion: 'Administración de puestos disponibles',
    icono: 'i-lucide-briefcase-business',
    ruta: '/vacantes'
  },
  {
    titulo: 'Candidatos',
    descripcion: 'Registro y gestión de candidatos',
    icono: 'i-lucide-users',
    ruta: '/candidatos'
  },
  {
    titulo: 'Postulaciones',
    descripcion: 'Seguimiento de solicitudes de empleo',
    icono: 'i-lucide-file-text',
    ruta: '/postulaciones'
  },
  {
    titulo: 'Entrevistas',
    descripcion: 'Programación y evaluación de entrevistas',
    icono: 'i-lucide-calendar-days',
    ruta: '/entrevistas'
  }
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">
        Dashboard
      </h1>

      <p class="text-gray-500 mt-1">
        Bienvenido al Sistema de Reclutamiento
        y Selección de Personal.
      </p>
    </div>

    <UAlert
        icon="i-lucide-circle-check"
        color="success"
        variant="soft"
        title="Sistema funcionando"
        description="Tu frontend Nuxt está conectado con Laravel."
    />

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <NuxtLink
          v-for="modulo in modulos"
          :key="modulo.ruta"
          :to="modulo.ruta"
          class="block"
      >
        <UCard class="h-full hover:ring-2 hover:ring-primary-400 transition-all">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-xl bg-primary-50 dark:bg-primary-950">
              <UIcon :name="modulo.icono" class="text-2xl text-primary" />
            </div>

            <div>
              <h3 class="font-semibold">
                {{ modulo.titulo }}
              </h3>

              <p class="text-sm text-gray-500 mt-2">
                {{ modulo.descripcion }}
              </p>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
