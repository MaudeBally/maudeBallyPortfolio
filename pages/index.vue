<template>
    <div v-if="isMounted" class="portfolio-container" :style="{ gridTemplateColumns: `repeat(${columnsNb}, 1fr)` }">
        <div v-for="(col, colIndex) in columns" :key="colIndex" class="portfolio-container-col"
            :class="`col${colIndex + 1}`">
            <div v-for="project in col" :key="project._id" class="project-container">
                <img class="thumbnail" :src="project.thumbnail ? project.thumbnail.url : 'https://as1.ftcdn.net/jpg/02/68/55/60/1000_F_268556012_c1WBaKFN5rjRxR2eyV33znK4qnYeKZjm.jpg'" :alt="project.title[locale]"
                    @click="navigateToProject(project.slug)" />
                <span class="project-title">{{project.title[locale]}}</span>
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

const isMounted = ref(false)

onMounted(() => {
    isMounted.value = true
})

const columnsNb = computed(() => {
    if (!isMounted.value) return 1

    if (width.value < 700) return 1
    if (width.value < 1000) return 2
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

watchEffect(() => {
    console.log(store)
    console.log(columns.value)
})
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
    position: relative;
    cursor: pointer;
}

.thumbnail {
    width: 90%;
    transition: 0.2s;
}

.project-title {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: 0.2s;
}

.project-container:hover .thumbnail {
    filter: blur(10px)
}

.project-container:hover .project-title {
    opacity: 1;
}
</style>