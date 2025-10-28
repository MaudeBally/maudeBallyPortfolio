<script setup>
import { ref } from 'vue'

const { id } = useRoute().params

const store = useProjectsStore()
// Vérifie si les projets sont déjà chargés (par ex. depuis la page d’accueil)
await store.fetchProjects()

// Essaie de trouver le projet dans le store
const project = ref(store.projects.find(p => p._id === id))

// Si non trouvé → fetch directement le projet via API
if (!project.value) {
    const res = await $fetch(`/api/projects/${id}`)
    project.value = res.project || null
}

watchEffect(() => {
    console.log(project.value)
})
</script>

<template>
    <div class="project-data-container">
        <h2 class="project-title">{{ project.title }}</h2>
        <p class="project-description">{{ project.description }}</p>
        <div class="photos-container">
            <div v-for="photo in project.photos" class="photo-container">
                <img :src="`/projects/${id}/${photo}`">
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
    column-count: 2;
    column-gap: 20px;
}

.photo-container {
    break-inside: avoid;
    margin-bottom: 20px;
}

img {
    width: 100%;
    display: block;
}

.project-description {
    white-space: pre-line;
}
</style>