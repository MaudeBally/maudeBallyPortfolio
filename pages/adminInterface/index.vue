<template>
    <div class="admin-dashboard-container">
        <h1>Maude Bally's Dashboard</h1>

        <div class="create-project-button-container">
            <button class="create-project-button" @click="openNewProjectForm()">Créer un nouveau projet</button>
        </div>

        <div v-if="newProjectPageOpen" class="create-project-page">
            <h1>Nouveau Projet</h1>
            <form class="new-project-form" @submit.prevent="submitNewProject()">
                <div class="input-container category-container">
                    <h3>Catégories</h3>
                    <input v-model="categories" type="checkbox" id="travauxpersonnel" value="Travaux personnels" />
                    <label for="travauxpersonnel">Travaux Personnels</label><br><br>
                    <input v-model="categories" type="checkbox" id="collaborations" value="Collaborations" />
                    <label for="collaborations">Collaborations</label><br><br>
                    <input v-model="categories" type="checkbox" id="mandats" value="Mandats" />
                    <label for="mandats">Mandats</label><br>
                    <span v-if="missingCategory" class="alert-message">Il faut choisir au moins une catégorie</span>
                </div>
                <div class="input-container title-container">
                    <h3>Titre du projet</h3>
                    <input v-model="title" placeholder="Titre" style="width:100%" />
                    <span v-if="missingTitle" class="alert-message">Il manque un titre</span>
                </div>
                <div class="input-container description-container">
                    <h3>Description du projet</h3>
                    <textarea v-model="description" rows="5" placeholder="Description"></textarea>
                </div>
                <div class="input-container photos-container">
                    <h3>Photos</h3>
                    <input @change="addFile" id="photos" type="file" multiple accept="image/*" />
                    <label for="photos" class="custom-file-upload">Ajouter des photos</label><br>
                    <span v-if="missingPhotos" class="alert-message">Il faut ajouter au moins une photo</span>
                    <div v-if="previewUrls.length" class="photo-preview-container">
                        <div v-for="(photo, index) in previewUrls" :key="index" class="photo-container">
                            <div class="photo-button-container">
                                <button type="button" class="infront-photo" @click="selectImageAsThumbnail(index)">
                                    <font-awesome-icon icon="fa-regular fa-star" />
                                </button>
                                <button type="button" class="delete-photo" @click="removeImage(index)">
                                    <font-awesome-icon icon="fa-solid fa-xmark" />
                                </button>
                            </div>
                            <progress :value="progress[index]" max="100" class="upload-progress-bar">{{ progress[index]
                            }}%</progress>
                            <img :src="photo" alt="Preview" class="photo-preview">
                        </div>
                    </div>
                </div>
                <div class="new-project-buttons-container">
                    <button type="button" class="cancel-button" @click="closeNewProjectForm()">Annuler</button>
                    <button class="confirm-button" type="submit">Créer projet</button>
                </div>
                <span v-if="error" class="alert-message">{{ error }}</span>
            </form>
        </div>

        <div v-if="!newProjectPageOpen" class="projects-container">
            <div v-for="project in projects" :key="project._id" class="project-container">
                <div class="thumbnail">
                    <img :src="'/projects/' + project._id + '/' + project.photos[0]">
                </div>
                <div class="title">{{ project.title }}</div>
                <div class="category-container">
                    <span v-for="category in project.category" class="category">{{ category }}</span>
                </div>
                <div class="project-buttons-container">
                    <button class="modify-button" @click="selectProjectToModify(project)">Modifier</button>
                    <button class="delete-button" @click="selectProjectToDelete(project)">Supprimer</button>
                </div>
            </div>
        </div>


        <DeleteValidationComponent v-if="projectToDelete" :project="projectToDelete" @cancel="projectToDelete = null"
            @confirm="deleteProject(projectToDelete)" />

        <ModifyProjectComponent v-if="projectToModify" :project="projectToModify" @cancel="projectToModify = null"
            @save="modifyProject(projectToModify)" />

    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import axios from 'axios'
import DeleteValidationComponent from '~/components/modals/DeleteValidationComponent.vue';
import ModifyProjectComponent from '~/components/modals/ModifyProjectComponent.vue';

const { user } = await $fetch("/api/me");
const projects = ref([])
onMounted(async () => {
    try {
        const res = await $fetch("/api/projects/getAllProjects")
        projects.value = res.projects || []
    } catch (err) {
        console.error("Erreur chargement projets:", err)
    }
})

definePageMeta({
    layout: "none"
})

const newProjectPageOpen = ref(false)
function openNewProjectForm() {
    newProjectPageOpen.value = true
}
function closeNewProjectForm() {
    newProjectPageOpen.value = false
    resetFields()
}
function resetFields() {
    title.value = ""
    description.value = ""
    categories.value = []
    photos.value = []
    previewUrls.value = []
    progress.value = []
}

const title = ref("")
const description = ref("")
const categories = ref([])
const photos = ref([])
const previewUrls = ref([])
const progress = ref([])

// Ajouter des images
function addFile(e) {
    const selectedFiles = Array.from(e.target.files)
    // Ajouter les nouveaux fichiers au tableau existant
    photos.value.push(...selectedFiles)
    // Générer les URLs de prévisualisation
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    previewUrls.value.push(...newPreviews)
    //Pour la barre de progression
    selectedFiles.forEach(() => progress.value.push(0))
    // Réinitialiser l'input pour que le même fichier puisse être re-uploadé
    e.target.value = ''
}

// Supprimer une image spécifique
function removeImage(index) {
    photos.value.splice(index, 1)
    URL.revokeObjectURL(previewUrls.value[index]) // libère la mémoire
    previewUrls.value.splice(index, 1)
    progress.value.splice(index, 1)
}

const missingCategory = ref(false)
const missingTitle = ref(false)
const missingPhotos = ref(false)
const error = ref("");
async function submitNewProject() {
    console.log("submitNewProject function ??")
    missingCategory.value = categories.value.length === 0
    missingTitle.value = !title.value
    missingPhotos.value = photos.value.length === 0

    //test que tous les champs obligatoires sont remplis
    if (missingCategory.value || missingTitle.value || missingPhotos.value) return

    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('description', description.value)
    categories.value.sort().forEach(cat => {
        formData.append("category", cat)
    })
    photos.value.forEach(file => formData.append('photos', file))

    const res = await axios.post('/api/projects/createNewProject', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
            if (event.total) {
                const percent = Math.round((event.loaded / event.total) * 100)
                progress.value = photos.value.map(() => percent)
            }
        }
    })

    if (!res.data.success) {
        error.value = res.message;
    } else {
        projects.value.unshift(res.data.project)
        closeNewProjectForm();
    }
}
watchEffect(() => {
    if (categories.value.length > 0) {
        missingCategory.value = false
    }
    if (title.value) {
        missingTitle.value = false
    }
    if (photos.value.length > 0) {
        missingPhotos.value = false
    }
})

/* ----------------------------------------------- DELETE MANAGEMENT ------------------------------------------- */
const projectToDelete = ref()
function selectProjectToDelete(project) {
    projectToDelete.value = project
}
async function deleteProject(project) {
    try {
        const res = await $fetch('/api/projects/deleteProject', {
            method: 'POST',
            body: { projectId: project._id }
        })

        if (res.success) {
            projects.value = projects.value.filter(p => p._id !== project._id)
            projectToDelete.value = null
        } else {
            alert(res.message)
        }
    } catch (err) {
        console.error(err)
    }
}

/* ------------------------------------------------------ MODIFY MANAGEMENT ------------------------------------------ */
const projectToModify = ref()
function selectProjectToModify(project) {
    projectToModify.value = project
}
async function modifyProject(project) {
    try {

    } catch (err) {
        console.log(err)
    }
}

/* ------------------------------------------------------ Empêcher scroll si une modal est ouverte --------------------------- */
watchEffect(() => {
    if (!process.client) return //pour bloquer l'execution côté serveur. (Etre sûr que le document est chargé clientside)

    if (projectToModify.value || projectToDelete.value) {
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
        document.body.style.paddingRight = `${scrollBarWidth}px`
        document.body.classList.add("no-scroll")
    } else {
        document.body.classList.remove("no-scroll")
        document.body.style.paddingRight = ''
    }
}, [projectToDelete, projectToModify])
</script>

<style scoped>
/* ------------------------------------------------ Global ----------------------------------------------------- */
.admin-dashboard-container {
    display: flex;
    flex-direction: column;
    padding: 50px 25px 50px 25px;
}

.create-project-button-container {
    display: flex;
    justify-content: end;
}

.create-project-button {
    font-size: 20px;
    padding: 10px 20px 10px 20px;
    border-radius: 15px;
    background-color: lightgray;
    cursor: pointer;
}

.projects-container {
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    border-bottom: 1px black solid;
}

.project-container {
    height: 140px;
    width: 100%;
    padding: 10px 0 10px 0;
    border-top: solid 1px black;
    display: grid;
    grid-template-columns: 130px 1fr 1fr 1fr;
    align-items: center;
}

.project-container>div:not(:last-child) {
    height: 75%;
    border-right: solid 1px black;
}

.project-container>div:first-child {
    border-right: none;
}

.thumbnail {
    width: 100px;
    height: 100px;
    overflow: hidden;
    display: flex;
    align-items: center;
    margin: 0 10px 0 10px;
}

.thumbnail img {
    width: 100%;
    height: auto;
    object-fit: cover;
}

.title {
    line-height: 75%;
    display: flex;
    align-items: center;
}

.project-container .category-container {
    display: flex;
    align-items: center;
    padding-left: 15px;
}

.category:not(:first-child) {
    border-left: 1px solid brown;
    padding-left: 10px;
}

.category {
    padding-right: 10px;
}

.project-buttons-container {
    display: flex;
    gap: 20px;
    justify-content: end;
}

.delete-button {
    color: red;
}

/* -------------------------------------------------------------------- Create project page ---------------------------------------------- */
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

.alert-message {
    font-size: 12px;
    color: red;
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
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
}

.photo-container {
    position: relative;
    width: 200px;
    height: 200px;
    overflow: hidden;
}

.photo-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* clé magique : remplit sans déformer */
    object-position: center;
    /* centre l'image */
}

.photo-button-container {
    position: absolute;
    color: white;
    margin: 0 10px 0 10px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: space-between;
    top: 10px;
}

.upload-progress-bar {
    position: absolute;
    width: calc(100% - 20px);
    bottom: 10px;
    margin: 0 10px 0 10px;
}

.new-project-buttons-container {
    display: flex;
    justify-content: center;
    gap: 25px;
    margin-top: 25px;
}

.confirm-button {
    padding: 10px 20px 10px 20px;
    border-radius: 15px;
    background-color: lightgray;
}

.cancel-button {
    color: red;
}

button {
    cursor: pointer;
}
</style>