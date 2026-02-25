<script setup>
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { locale } = useI18n()

const { slug } = useRoute().params

const store = useProjectsStore()
// Vérifie si les projets sont déjà chargés (par ex. depuis la page d’accueil)
await store.fetchProjects()

// Essaie de trouver le projet dans le store
const project = ref(store.projects.find(p => p.slug === slug))

// Si non trouvé → fetch directement le projet via API
if (!project.value) {
    const res = await $fetch(`/api/projects/${slug}`)
    project.value = res.project || null
}

store.setProject(project)

// Déclenché quand on quitte cette page
onBeforeRouteLeave((to, from, next) => {
    store.setProject(null) // supprime selectedProject
    next() // continue la navigation
})

const { width, height } = useWindowSize()
const columnsNb = computed(() => {
    if (width.value < 700) {
        return 1
    }
    return 2
})
</script>

<template>
    <div class="project-data-container">
        <h2 class="project-title">{{ project.title[locale] }}</h2>
        <p class="project-description">{{ project.description[locale] }}</p>
        <div class="photos-container" :style="{ columnCount: columnsNb }">
            <div v-for="photo in project.photos" class="photo-container">
                <img :src="photo.url">
            </div>
        </div>
    </div>
</template>

<style scoped>
.project-data-container {
    width: 100%;
}

.photos-container {
    width: 100%;
    margin: 30px 0;
    column-gap: 20px;
}

.photo-container {
    break-inside: avoid;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
}

img {
    display: block;
    max-height: 80vh;
    max-width: 100%;
}

.project-description {
    white-space: pre-line;
}
</style>