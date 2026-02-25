// middleware/redirectDefaultLocale.global.js
export default defineNuxtRouteMiddleware((to) => {
  const defaultLocale = 'fr'
  const supportedLocales = ['fr', 'en']

  // Vérifie si l'URL commence par un des préfixes
  const hasLocalePrefix = supportedLocales.some(
    (code) => to.path.startsWith(`/${code}/`) || to.path === `/${code}`
  )

  if (!hasLocalePrefix) {
    // Redirection vers la langue par défaut
    return navigateTo(`/${defaultLocale}${to.fullPath}`)
  }
})