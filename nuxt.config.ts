// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Maude Bally',
      meta: [
        {name: 'description', content: 'portfolio for Maude Bally'}
      ]
    }
  }
})
