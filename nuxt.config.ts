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
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    }
  },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'fr', name: 'Fr', file: 'fr.json' },
      { code: 'en', name: 'En', file: 'en.json' }
    ],
    defaultLocale: 'fr',
    strategy: 'prefix', // important : met le code langue dans l'URL
    langDir: 'locales/', // dossier contenant fr.json et en.json
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root' // redirige automatiquement la racine
    }
  },
  ssr: true,
  nitro: {
    preset: 'vercel',
  },
  runtimeConfig: {
    mongoUri: process.env.MONGO_URI,
    jwt_secret: process.env.JWT_SECRET
  }
})