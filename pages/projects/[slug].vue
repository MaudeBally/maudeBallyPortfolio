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


const randomPhotoFromProject = computed(() => {
    const photoIndex = randomIntFromInterval(0, project.value.photos.length - 1)
    return project.value.photos[photoIndex].url
})

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
</script>

<template>
    <div class="project-data-container">
        <NuxtLink class="go-back-button" :to="`/${locale}`">{{ $t('divers.close') }}</NuxtLink>
        <div class="project-description-container">
            <div class="project-text-container">
                <h2 class="project-title">{{ project.title[locale] }}</h2>
                <p class="project-description">{{
                    project.description[locale] }}</p>
            </div>
            <img class="thumbnail" :src="project.thumbnail.url" :alt="project.thumbnail.public_id">
        </div>
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
    display: flex;
    flex-direction: column;
    min-height: calc(100dvh - 100px);
    gap: 100px;
}

.project-description-container {
    display: flex;
    width: 100%;
    flex: 1;
    gap: 50px;
    justify-content: center;
    align-items: center;
    margin-top: 100px;
}

.project-description {
    width: 300px;
    white-space: pre-line;
}

.thumbnail {
    width: 200px;
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
}

.go-back-button {
    text-decoration: none;
    color: brown;
    position: absolute;
    right: 32px;
}



@media (max-width: 560px) {
    .project-data-container {
        gap: 0;
    }

    .project-description-container {
        flex-direction: column-reverse;
        margin-top: 50px;
        gap: 25px;
    }

    .contact-info-container {
        padding-bottom: 50px;
    }

    .project-text-container {
        width: 100%;
    }
}
</style>