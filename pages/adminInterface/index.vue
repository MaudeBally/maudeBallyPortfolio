<template>
    <div>
        <h1>Maude Bally's Dashboard</h1>

        <button class="create-project-button" @click="openNewProjectForm()">+</button>

        <div v-if="newProjectPageOpen" class="create-project-page">
            <h1>Nouveau Projet</h1>
            <form class="new-project-form" @submit.prevent="console.log('submit')">
                <div class="input-container category-container">
                    <h3>Catégories</h3>
                    <input v-model="categories" type="checkbox" id="travauxpersonnel" value="Travaux personnels" />
                    <label for="travauxpersonnel">Travaux Personnels</label><br><br>
                    <input v-model="categories" type="checkbox" id="collaborations" value="Collaborations" />
                    <label for="collaborations">Collaborations</label><br><br>
                    <input v-model="categories" type="checkbox" id="mandats" value="Mandats" />
                    <label for="mandats">Mandats</label>
                </div>
                <div class="input-container title-container">
                    <h3>Titre du projet</h3>
                    <input v-model="title" placeholder="Titre" style="width:100%" />
                </div>
                <div class="input-container description-container">
                    <h3>Description du projet</h3>
                    <textarea v-model="description" rows="5" placeholder="Description"></textarea>
                </div>
                <div class="input-container photos-container">
                    <h3>Photos</h3>
                    <input @change="addFile" id="photos" type="file" multiple accept="image/*" />
                    <label for="photos" class="custom-file-upload">Ajouter des photos</label>
                    <div v-if="previewUrls.length" class="photo-preview-container">
                        <div v-for="(photo, index) in previewUrls" :key="index" class="photo-container">
                            <button class="delete-photo" @click="removeImage(index)">X</button>
                            <img :src="photo" alt="Preview" class="photo-preview">
                        </div>
                    </div>
                </div>
                <div class="new-project-buttons-container">
                    <button class="cancel-button" @click="closeNewProjectForm()">Annuler</button>
                    <button class="confirm-button" type="submit">Créer projet</button>
                </div>
            </form>
        </div>

        <div class="projects-container">
            <div v-for="project in projects" :key="project._id" class="project-container">
                <div class="title">{{ project.title }}</div>
                <div class="project-buttons-container">
                    <button class="modify-button">modify</button>
                    <button class="delete-button">-</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const { user } = await $fetch("/api/me");
const { projects } = await $fetch("/api/projects/getAllProjects")

console.log(user)
console.log(projects)

definePageMeta({
    layout: 'none'
})

const newProjectPageOpen = ref(false)
function openNewProjectForm() {
    newProjectPageOpen.value = true
}
function closeNewProjectForm() {
    newProjectPageOpen.value = false
}

const title = ref("")
const description = ref("")
const categories = ref([])
const photos = ref([])
const previewUrls = ref([])

// Ajouter des images
function addFile(e) {
    const selectedFiles = Array.from(e.target.files)
    // Ajouter les nouveaux fichiers au tableau existant
    photos.value.push(...selectedFiles)
    // Générer les URLs de prévisualisation
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    previewUrls.value.push(...newPreviews)
    console.log(photos.value)
}

// Supprimer une image spécifique
function removeImage(index) {
  photos.value.splice(index, 1)
  URL.revokeObjectURL(previewUrls.value[index]) // libère la mémoire
  previewUrls.value.splice(index, 1)
}

watchEffect(() => {
    console.log(previewUrls.value)
})
</script>

<style scoped>
.create-project-button {
    width: 50px;
    height: 50px;
    font-size: 30px;
    background-color: lightgray;
    border-radius: 50%;
    cursor: pointer;
}

.create-project-page {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100dvw - 50px);
    min-height: calc(100dvh - 100px);
    background-color: white;

    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 50px 25px 50px 25px;
}

.new-project-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
    width: 100%;
}

label:not(.custom-file-upload) {
    margin-left: 10px;
}

textarea {
    width: calc(100% - 12px);
    resize: none;
    padding: 5px;
}

.photos-container input {
    display: none;
}

.custom-file-upload {
    cursor: pointer;
}

.photo-preview-container {
    margin-top: 30px;
    width: 100%;
    display:flex;
    flex-wrap: wrap;
    gap: 30px;
}

.photo-container {
    width: 200px;
}

.photo-preview {
    width: 100%;
    height: auto;
}

.new-project-buttons-container {
    display: flex;
    justify-content: center;
    gap: 25px;
    margin-top: 25px;
}

.add-button {}

.cancel-button {
    color: red;
}

button {
    cursor: pointer;
}
</style>