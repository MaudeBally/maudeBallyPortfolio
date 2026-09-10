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

const photoColumns = computed(() => {
    const columns = Array.from(
        { length: columnsNb.value },
        () => []
    )

    project.value.photos.forEach((photo, index) => {
        columns[index % columnsNb.value].push(photo)
    })

    return columns
})
</script>

<template>
    <div class="project-data-container">
        <NuxtLink class="go-back-button" :to="`/${locale}`">{{ $t('divers.close') }}</NuxtLink>
        <h2 class="project-title">{{ project.title[locale] }}</h2>
        <p class="project-description" :style="{width: columnsNb === 1 ? '100%' : '50%'}">{{ project.description[locale] }}</p>
        <div class="photos-container">
            <div v-for="(column, columnIndex) in photoColumns" :key="columnIndex" class="photo-column">
                <div v-for="photo in column" :key="photo.public_id" class="photo-container">
                    <img
                        :src="photo ? photo.url : 'https://as1.ftcdn.net/jpg/02/68/55/60/1000_F_268556012_c1WBaKFN5rjRxR2eyV33znK4qnYeKZjm.jpg'">
                </div>
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
    display: flex;
    gap: 20px;
}

.photo-column {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.photo-container {
    break-inside: avoid;
    width: 100%;
    display: flex;
    justify-content: center;
}

img {
    display: block;
    max-height: 80vh;
    max-width: 100%;
    width: 100%;
    height: auto;
}

.project-description {
    white-space: pre-line;
}

.go-back-button {
    text-decoration: none;
    color: brown;
    position: absolute;
    right: 32px;
}

.go-back-button:hover {

}
</style>