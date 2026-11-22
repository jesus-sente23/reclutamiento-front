export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    laravelApiUrl: 'http://127.0.0.1:8000/api'
  }
})