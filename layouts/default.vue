<script setup>
import { ref, reactive } from 'vue';

const { locales, setLocale, locale } = useI18n()

/* ---------------------------------- Contact POPUP --------------------------------------------------------- */
const isContactShowing = ref(false)
function enableContact() {
    isContactShowing.value = true
    bringToFront(0)
}
function disableContact() {
    isContactShowing.value = false
}

/* ------------------------------------------ BIOGRAPHY POPUP ------------------------------------------------- */
const isBiographyShowing = ref(false)
function enableBiography() {
    isBiographyShowing.value = true
    bringToFront(1)
}
function disableBiography() {
    isBiographyShowing.value = false
}

//Manage dragging of elements in layout
const draggableItems = reactive([
    { x: 20, y: 100, zIndex: 1, isDragging: false },
    { x: 50, y: 150, zIndex: 0, isDragging: false }
]);
const contact = ref(null);
const biography = ref(null);

let dragIndex = null;
let offset = { x: 0, y: 0 };
let elementWidth = 0;
let elementHeight = 0;

function startDrag(index, event) {
    dragIndex = index;
    bringToFront(index)
    draggableItems[index].isDragging = true;

    const el = index === 0 ? contact.value : biography.value;
    elementWidth = el.offsetWidth;
    elementHeight = el.offsetHeight;

    offset.x = event.clientX - draggableItems[index].x;
    offset.y = event.clientY - draggableItems[index].y;

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
}

function onDrag(event) {
    if (dragIndex === null) return;

    const maxX = window.innerWidth - elementWidth;
    const maxY = window.innerHeight - elementHeight;

    let newX = event.clientX - offset.x;
    let newY = event.clientY - offset.y;

    // Empêche de dépasser les bords
    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(70, Math.min(maxY, newY));

    draggableItems[dragIndex].x = newX;
    draggableItems[dragIndex].y = newY;
}

function stopDrag() {
    if (dragIndex !== null) {
        draggableItems[dragIndex].isDragging = false;
        dragIndex = null;
    }
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
}

//Bring dragged items in front
function bringToFront(index) {
    draggableItems.forEach(item => {
        item.zIndex = 0
    })
    draggableItems[index].zIndex = 1
}

/* --------------------------------------------------- MANAGEMENT OF FILTERS ------------------------------------------------------------- */
const store = useProjectsStore()
await store.fetchProjects()
const categories = ref(store.categories)
const projectsByCategory = ref(store.projectsByCategory)

console.log(categories.value)
console.log(projectsByCategory.value)

const route = useRoute()
const isBlocked = computed(() => route.name.includes("projects-id"))

function onCategoryChange(category) {
    if (!isBlocked.value) {
        store.setCategory(category)
    }
}

function onProjectSelection(project) {
    if (project.category.includes(store.activeCategory) || !store.activeCategory) {
        navigateTo(`/projects/${project._id}`)
        store.setCategory(null)
    }
}

/* ----------------------------------------------------- HIDE FILTERS ON PROJECT ---------------------------------------------------------- */
const isProjectView = computed(() => {
    return route.name.includes("projects-id") 
})

</script>

<template>
    <div>
        <header>
            <NuxtLink class="title" to="/">Maude Bally</NuxtLink>
            <div class="nav">
                <button @click="enableContact()">{{ $t('nav.contact') }}</button>
                <button @click="enableBiography()">{{ $t('nav.bio') }}</button>
                <div class="language-picker">
                    <button v-for="localeI in locales" :class="{ active: locale === localeI.code }" @click="setLocale(localeI.code)">
                        {{ localeI.name }}
                    </button>
                </div>
            </div>
        </header>
        <div class="main-content" :class="{ noMargin: isProjectView }">
            <div v-if="!isProjectView" class="filter-container">
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

        <div v-show="isContactShowing" class="contact-container pop-up"
            :style="{ top: `${draggableItems[0].y}px`, left: `${draggableItems[0].x}px`, 'z-index': draggableItems[0].zIndex }"
            ref="contact">
            <div class="pop-up-header" @mousedown="startDrag(0, $event)">
                <button class="exit" @click="disableContact()">x</button>
                <p>{{ $t('contact.title') }}</p>
            </div>
            <div class="pop-up-content">
                Maude Bally <br><br>
                <a href="https://www.instagram.com/maude_bally/" target="_blank">@maude_bally</a><br>
                <a href="mailto:m.bally@infomaniak.ch">m.bally@infomaniak.ch</a><br>
                <p>079/814.11.52</p>
            </div>
        </div>


        <div v-show="isBiographyShowing" class="biography-container pop-up"
            :style="{ top: `${draggableItems[1].y}px`, left: `${draggableItems[1].x}px`, 'z-index': draggableItems[1].zIndex }"
            ref="biography">
            <div class="pop-up-header" @mousedown="startDrag(1, $event)">
                <button class="exit" @click="disableBiography()">x</button>
                <p>{{ $t('bio.title') }}</p>
            </div>
            <div class="pop-up-content">
                {{ $t('bio.text') }}
            </div>
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

.nav {
    display: flex;
    gap: 1rem;
    margin-left: auto;
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
    font-family: 'AltesHaasGrotestBold', sans-serif;
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

/* ------------------------------------- POPUP ---------------------------------------------------- */
.pop-up {
    width: 300px;
    position: fixed;
    border: solid 1px brown;
    background-color: white;
}

.pop-up-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: solid 1px brown;
    padding: 0.5rem 1rem;
    cursor: grab;
}

.pop-up-content {
    padding: 0.5rem 1rem;
}

.pop-up-content a{
    color: brown;
    text-decoration: none;
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