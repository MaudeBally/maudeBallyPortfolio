// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],
  app: {
    head: {
      title: 'Maude Bally',
      meta: [
        { name: 'description', content: 'portfolio for Maude Bally' }
      ]
    }
  },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'fr', name: 'Fr', file: 'fr.json' },
      { code: 'en', name: 'En', file: 'en.json' }
    ],
    defaultLocale: 'fr',
  },
  ssr: true,
  nitro: {
    preset: 'node-server',
  },
  runtimeConfig: {
    mongoUri: process.env.MONGO_URI,
    jwt_secret: process.env.JWT_SECRET
  }
})