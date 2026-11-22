
<script setup lang="ts">
const mensaje = ref('')
const cargando = ref(false)

const probarConexion = async () => {
  cargando.value = true
  mensaje.value = ''

  try {
    const respuesta = await $fetch<{
      success: boolean
      message: string
    }>('/api/conexion')

    mensaje.value = respuesta.message
  } catch (error) {
    mensaje.value = 'Error al conectar con Laravel'
    console.error(error)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
    <UCard class="w-full max-w-lg">
      <div class="space-y-5 text-center">
        <h1 class="text-2xl font-bold">
          Sistema de Reclutamiento
        </h1>

        <p class="text-gray-500">
          Gestión de Vacantes, Candidatos,
          Postulaciones y Entrevistas
        </p>

        <UBadge color="success" variant="subtle">
          Frontend funcionando
        </UBadge>

        <div class="flex flex-col items-center gap-4">

          <UButton
              color="primary"
              @click="probarConexion"
          >
            Probar conexión con Laravel
          </UButton>

          <UButton
              to="/login"
              icon="i-lucide-log-in"
              color="primary"
              variant="outline"
          >
            Iniciar sesión
          </UButton>

        </div>

        <UAlert
            v-if="mensaje"
            :color="mensaje.includes('exitosa') ? 'success' : 'error'"
            :title="mensaje"
        />
      </div>
    </UCard>
  </div>
</template>
