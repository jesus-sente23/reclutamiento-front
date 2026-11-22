<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const usuario = ref({
  name: '',
  email: ''
})

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

const cerrandoSesion = ref(false)

async function cerrarSesion() {
  cerrandoSesion.value = true

  try {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })

    await navigateTo('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    cerrandoSesion.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950">

    <header
        class="bg-white dark:bg-gray-900 border-b
             border-gray-200 dark:border-gray-800 p-5"
    >
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">
          Sistema de Reclutamiento
        </h1>

        <UButton
            color="error"
            variant="outline"
            icon="i-lucide-log-out"
            :loading="cerrandoSesion"
            @click="cerrarSesion"
        >
          Cerrar sesión
        </UButton>
      </div>
    </header>

    <main class="max-w-6xl mx-auto p-6 space-y-6">

      <div>
        <h2 class="text-2xl font-bold">
          ¡Bienvenido, {{ usuario.name }}!
        </h2>

        <p class="text-gray-500">
          {{ usuario.email }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

        <UCard>
          <div class="space-y-2">
            <UIcon
                name="i-lucide-briefcase-business"
                class="text-3xl text-primary"
            />
            <h3 class="font-semibold">Vacantes</h3>
            <p class="text-sm text-gray-500">
              Administración de vacantes
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="space-y-2">
            <UIcon
                name="i-lucide-users"
                class="text-3xl text-primary"
            />
            <h3 class="font-semibold">Candidatos</h3>
            <p class="text-sm text-gray-500">
              Gestión de candidatos
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="space-y-2">
            <UIcon
                name="i-lucide-file-check"
                class="text-3xl text-primary"
            />
            <h3 class="font-semibold">Postulaciones</h3>
            <p class="text-sm text-gray-500">
              Seguimiento de postulaciones
            </p>
          </div>
        </UCard>

      </div>

    </main>
  </div>
</template>
