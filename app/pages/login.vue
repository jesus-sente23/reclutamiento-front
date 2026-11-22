<script setup lang="ts">
const email = ref('')
const password = ref('')
const cargando = ref(false)
const error = ref('')

async function iniciarSesion() {
  error.value = ''
  cargando.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    await navigateTo('/dashboard')
  } catch (e) {
    error.value = 'Correo o contraseña incorrectos'
    console.error(e)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div
      class="min-h-screen flex items-center justify-center
           bg-gray-100 dark:bg-gray-950 p-4"
  >
    <UCard class="w-full max-w-md">
      <div class="space-y-6">

        <div class="text-center space-y-2">
          <div
              class="mx-auto w-14 h-14 rounded-2xl bg-primary-100
                   dark:bg-primary-900 flex items-center justify-center"
          >
            <UIcon
                name="i-lucide-users"
                class="text-3xl text-primary"
            />
          </div>

          <h1 class="text-2xl font-bold">
            Bienvenido
          </h1>

          <p class="text-sm text-gray-500">
            Sistema de Reclutamiento y Selección de Personal
          </p>
        </div>

        <form
            class="space-y-4"
            @submit.prevent="iniciarSesion"
        >
          <UFormField
              label="Correo electrónico"
              required
          >
            <UInput
                v-model="email"
                type="email"
                placeholder="Ingrese su correo"
                icon="i-lucide-mail"
                autocomplete="username"
                class="w-full"
                required
            />
          </UFormField>

          <UFormField
              label="Contraseña"
              required
          >
            <UInput
                v-model="password"
                type="password"
                placeholder="Ingrese su contraseña"
                icon="i-lucide-lock"
                autocomplete="current-password"
                class="w-full"
                required
            />
          </UFormField>

          <UAlert
              v-if="error"
              color="error"
              variant="soft"
              :title="error"
              icon="i-lucide-circle-alert"
          />

          <UButton
              type="submit"
              block
              size="lg"
              :loading="cargando"
          >
            Iniciar sesión
          </UButton>
        </form>

        <p class="text-center text-xs text-gray-400">
          Sistema de Reclutamiento © 2026
        </p>

      </div>
    </UCard>
  </div>
</template>
