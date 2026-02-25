export default defineNuxtRouteMiddleware(async (to) => {
  // Vérifie si l'URL contient le code langue en prefix
  const localePrefix = to.path.split('/')[1]
  const supportedLocales = ['fr', 'en']

  if (!supportedLocales.includes(localePrefix)) {
    // Redirige vers la langue par défaut si pas de prefix
    return navigateTo(`/fr${to.fullPath}`)
  }

  // Authentification
  if (to.path.startsWith(`/${localePrefix}/adminInterface`)) {
    const headers = useRequestHeaders(['cookie'])
    const res = await $fetch('/api/me', { headers })
    if (!res.loggedIn) {
      return navigateTo(`/${localePrefix}/behindTheScene`)
    }
  }
})