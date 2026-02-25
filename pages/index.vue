<template>
    <div class="portfolio-container" :style="{ gridTemplateColumns: `repeat(${columnsNb}, 1fr)` }">
        <div v-for="(col, colIndex) in columns" :key="colIndex" class="portfolio-container-col"
            :class="`col${colIndex + 1}`">
            <div v-for="project in col" :key="project._id" class="project-container">
                <img class="thumbnail" :src="project.thumbnail.url" :alt="project.name"
                    @click="navigateToProject(project.slug)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
const { width, height } = useWindowSize()

const { locale } = useI18n()

const store = useProjectsStore()
await store.fetchProjects()

const columnsNb = computed(() => {
    if (width.value < 700) {
        return 1
    }
    if (width.value < 1000) {
        return 2
    }
    return 3
})

const columns = computed(() => {
    const cols = Array.from({ length: columnsNb.value }, () => [])

    store.filteredProjects.forEach((p, i) => {
        cols[i % columnsNb.value].push(p)
    })

    return cols
})

function navigateToProject(slug) {
    navigateTo(`${locale.value}/projects/${slug}`)
    store.setCategory(null)
}
</script>

<style scoped>
.portfolio-container {
    width: 100%;
    display: grid;
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