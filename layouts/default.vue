<script setup>
import { ref, reactive } from 'vue';

const { locales, setLocale, locale } = useI18n()

/* --------------------------------------------------- MANAGEMENT OF FILTERS ------------------------------------------------------------- */
const store = useProjectsStore()
await store.fetchProjects()
const categories = ref(store.categories)
const projectsByCategory = ref(store.projectsByCategory)

const route = useRoute()
const isBlocked = computed(() => route.name.includes("projects-slug"))

function onCategoryChange(category) {
    if (!isBlocked.value) {
        store.setCategory(category)
    }
}

function onProjectSelection(project) {
    if (project.category.includes(store.activeCategory) || !store.activeCategory) {
        navigateTo(`${locale.value}/projects/${project.slug}`)
        store.setCategory(null)
    }
}

/* ----------------------------------------------------- HIDE FILTERS ON PROJECT AND CONTACT ---------------------------------------------------------- */
const isProjectView = computed(() => {
    return route.name.includes("projects-slug")
})
const isContactView = computed(() => {
    return route.name.includes("contact")
})
</script>

<template>
    <div>
        <header>
            <NuxtLink class="title" :to="`/${locale}`">Maude Bally</NuxtLink>
            <div class="nav">
                <nuxt-link class="nav-link" to="/contact">{{ $t('nav.contact')+'/'+$t('nav.bio') }}</nuxt-link>
                <div class="language-picker">
                    <button v-for="localeI in locales" :class="{ active: locale === localeI.code }" @click="setLocale(localeI.code)">
                        {{ localeI.name }}
                    </button>
                </div>
            </div>
        </header>
        <div class="main-content" :class="{ noMargin: isProjectView || isContactView }">
            <div v-if="!isProjectView && !isContactView" class="filter-container">
                <ul>
                    <li v-for="category in categories" class="filter">
                        <span class="filter-entry" @click="onCategoryChange(category)" :class="{
                            selectedCategory: store.activeCategory === category || !store.activeCategory,
                            selectedProject: !store.activeProject
                        }">
                            {{ $t(`categories.${category}`) }}</span>
                        <ul class="project-entries-container">
                            <li v-for="project in projectsByCategory[category]" :id="project._id" class="project-entry"
                                :class="{ selectedProject: store.activeProject === project || !store.activeProject }"
                                @click="onProjectSelection(project)">
                                {{ project.title[locale] }}</li>
                        </ul>
                    </li>
                </ul>
            </div>
            <slot />
        </div>
    </div>
</template>

<style scoped>
header {
    width: calc(100% - 4rem);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    position: fixed;
    top: 0;
    background-color: white;
    z-index: 3;
    flex-wrap: wrap;
    row-gap: 10px;
}

.title {
    font-size: 2rem;
    text-decoration: none;
    color: brown;
}

.nav * {
    font-family: 'RobotoSlabRegular', sans-serif;
}

.nav {
    display: flex;
    gap: 1rem;
    margin-left: auto;
}

.nav-link {
    text-decoration: none;
    color: brown;
}

.active {
    font-weight: 600;
}

.main-content {
    display: flex;
    padding: 0 2rem;
    margin-top: 100px;
    margin-left: 250px;
}

.noMargin {
    margin-left: 0
}

.filter-container {
    width: 250px;
    font-size: 16px;
    font-family: 'RobotoSlabRegular', sans-serif;
    font-weight: 500;
    position: fixed;
    left: 0;
    padding-left: 32px;
}

.filter {
    margin-bottom: 5px;
}

.project-entries-container {
    margin-top: 5px;
}

.project-entry {
    margin-bottom: 2px;
}

.filter-entry:not(.selectedCategory),
.filter-entry:not(.selectedCategory)+ul>li {
    opacity: 0.5;
}

.filter-entry:not(.selectedProject),
.project-entry:not(.selectedProject) {
    opacity: 0.5;
}


button,
li {
    cursor: pointer;
}

/* -------------------------------------- MEDIA --------------------------------------------------- */
@media (max-width: 550px){
    .filter-container{
        display: none;
    }

    .main-content {
        margin-left: 0;
    }
}
</style>