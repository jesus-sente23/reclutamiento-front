<script setup lang="ts">
const route = useRoute()

const usuario = ref({
  name: '',
  email: ''
})

const menu = [
  { nombre: 'Dashboard', ruta: '/dashboard', icono: 'i-lucide-layout-dashboard' },
  { nombre: 'Unidades', ruta: '/unidades', icono: 'i-lucide-building-2' },
  { nombre: 'Vacantes', ruta: '/vacantes', icono: 'i-lucide-briefcase-business' },
  { nombre: 'Candidatos', ruta: '/candidatos', icono: 'i-lucide-users' },
  { nombre: 'Postulaciones', ruta: '/postulaciones', icono: 'i-lucide-file-text' },
  { nombre: 'Entrevistas', ruta: '/entrevistas', icono: 'i-lucide-calendar-days' },
]

const menuAbierto = ref(false)
const cerrandoSesion = ref(false)

const { data } = await useFetch<{
  success: boolean
  user: {
    id: number
    name: string
    email: string
  }
}>('/api/auth/me')

if (data.value?.user) {
  usuario.value = data.value.user
}

async function cerrarSesion() {
  cerrandoSesion.value = true

  try {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })

    await navigateTo('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  } finally {
    cerrandoSesion.value = false
  }
}

watch(() => route.path, () => {
  menuAbierto.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">

    <div
        v-if="menuAbierto"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="menuAbierto = false"
    />

    <aside
        class="fixed top-0 left-0 z-50 h-screen w-64
             bg-white dark:bg-gray-900 border-r
             border-gray-200 dark:border-gray-800
             flex flex-col transition-transform duration-200
             lg:translate-x-0"
        :class="menuAbierto ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-18 px-5 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <div class="p-2 rounded-xl bg-primary-100 dark:bg-primary-900">
          <UIcon name="i-lucide-briefcase-business" class="text-2xl text-primary" />
        </div>

        <div>
          <h1 class="font-bold text-base">Reclutamiento</h1>
          <p class="text-xs text-gray-500">Panel administrativo</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-3 space-y-1">
        <NuxtLink
            v-for="opcion in menu"
            :key="opcion.ruta"
            :to="opcion.ruta"
            class="flex items-center gap-3 px-4 py-3 rounded-lg
                 text-sm font-medium transition-colors"
            :class="route.path === opcion.ruta
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
        >
          <UIcon :name="opcion.icono" class="text-xl" />
          {{ opcion.nombre }}
        </NuxtLink>
      </nav>

      <div class="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
        <div class="flex items-center gap-3">
          <UAvatar :text="usuario.name?.charAt(0) || 'U'" />

          <div class="min-w-0">
            <p class="text-sm font-semibold truncate">
              {{ usuario.name }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ usuario.email }}
            </p>
          </div>
        </div>

        <UButton
            color="error"
            variant="outline"
            icon="i-lucide-log-out"
            block
            :loading="cerrandoSesion"
            @click="cerrarSesion"
        >
          Cerrar sesión
        </UButton>
      </div>
    </aside>

    <div class="lg:pl-64">
      <header
          class="h-18 bg-white dark:bg-gray-900 border-b
               border-gray-200 dark:border-gray-800
               px-5 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <UButton
              class="lg:hidden"
              color="neutral"
              variant="ghost"
              icon="i-lucide-menu"
              @click="menuAbierto = true"
          />

          <div>
            <h2 class="font-semibold">Sistema de Reclutamiento</h2>
            <p class="text-xs text-gray-500">
              Gestión y selección de personal
            </p>
          </div>
        </div>

        <UColorModeButton />
      </header>

      <main class="p-5 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
