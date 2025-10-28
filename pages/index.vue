<template>
    <div class="portfolio-container">
        <div v-for="(col, colIndex) in columns" :key="colIndex" class="portfolio-container-col"
            :class="`col${colIndex + 1}`">
            <div v-for="project in col" :key="project._id" class="project-container">
                <img class="thumbnail" :src="`/projects/${project._id}/${project.thumbnail}`" :alt="project.name" @click="navigateToProject(project._id)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

const store = useProjectsStore()
await store.fetchProjects()

const columns = computed(() => {
    const cols = [[], [], []]
    store.filteredProjects.forEach((p, i) => cols[i % 3].push(p))
    return cols
})

function navigateToProject(id) {
    navigateTo(`/projects/${id}`)
}
</script>

<style scoped>
.portfolio-container {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    margin-bottom: 50px;
}

.portfolio-container-col {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.col1 {
    margin-top: 50px;
}

.col2 {
    margin-top: 0px;
}

.col3 {
    margin-top: 100px;
}

.project-container {
    width: 100%;
    display: flex;
    justify-content: center;
}

.thumbnail {
    width: 90%;
    cursor: pointer;
    transition: 0.2s;
}

.thumbnail:hover {
    scale: 1.05;
    transform: rotateZ(-2deg);
}
</style>