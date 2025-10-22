<script setup>
import { ref, reactive } from 'vue';


const isContactShowing = ref(false)
function enableContact() {
    isContactShowing.value = true
    bringToFront(0)
}
function disableContact() {
    isContactShowing.value = false
}

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
    { x: 300, y: 100, zIndex: 1, isDragging: false },
    { x: 400, y: 150, zIndex: 0, isDragging: false }
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
    newY = Math.max(0, Math.min(maxY, newY));

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
</script>

<template>
    <div>
        <header>
            <NuxtLink class="title" to="/">Maude Bally</NuxtLink>
            <div class="nav">
                <div class="language-picker">
                    <button>Langue</button>
                </div>
                <button @click="enableContact()">Contact</button>
                <button @click="enableBiography()">Biographie</button>
            </div>
        </header>
        <div class="main-content">
            <div class="filter">
                <ul>
                    <li>Travaux personnels</li>
                    <ul>
                        <li>Titre de projet personnel</li>
                    </ul>
                    <li>Collaborations</li>
                    <ul>
                        <li>Titre de collaboration</li>
                    </ul>
                    <li>Mandats</li>
                    <ul>
                        <li>Titre de mandat</li>
                    </ul>
                </ul>
            </div>
            <slot />
        </div>

        <div v-show="isContactShowing" class="contact-container pop-up"
            :style="{ top: `${draggableItems[0].y}px`, left: `${draggableItems[0].x}px`, 'z-index': draggableItems[0].zIndex }"
            ref="contact">
            <div class="pop-up-header" @mousedown="startDrag(0, $event)">
                <button class="exit" @click="disableContact()">x</button>
                <p>Contact</p>
            </div>
            <div class="pop-up-content">
                Text de contact qui apparait
            </div>
        </div>


        <div v-show="isBiographyShowing" class="biography-container pop-up"
            :style="{ top: `${draggableItems[1].y}px`, left: `${draggableItems[1].x}px`, 'z-index': draggableItems[1].zIndex }"
            ref="biography">
            <div class="pop-up-header" @mousedown="startDrag(1, $event)">
                <button class="exit" @click="disableBiography()">x</button>
                <p>Biographie</p>
            </div>
            <div class="pop-up-content">
                Text de biographie qui apparait
            </div>
        </div>
    </div>
</template>

<style scoped>
header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem;
}

.title {
    font-size: 2rem;
    text-decoration: none;
    color: brown;
}

.nav {
    display: flex;
    gap: 1rem;
}

.main-content {
    display: flex;
    padding: 0 2rem;
}

.filter {
    width: 270px;
}

button,
li {
    cursor: pointer;
}

.pop-up {
    width: 300px;
    position: absolute;
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
</style>