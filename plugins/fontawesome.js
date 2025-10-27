/* plugins/fontawesome.js */
import { library, config } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Important : empêche FontAwesome d'ajouter automatiquement son CSS
// (Nuxt gère déjà le CSS séparément)
config.autoAddCss = false

// Ajoute les icônes à la librairie
library.add(fas, far)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('FontAwesomeIcon', FontAwesomeIcon)
})
