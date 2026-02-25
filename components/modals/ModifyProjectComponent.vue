<template>
    <div class="overlay">
        <div class="modal">
            <h1>{{ project.title[locale] }}</h1>
            <form class="modify-project-form" @submit.prevent="submitEdit()">

                <div class="input-container category-container">
                    <h3>Catégories</h3>
                    <input v-model="newProjectData.category" type="checkbox" id="travauxpersonnel" value="personnal" />
                    <label for="travauxpersonnel">Travaux Personnels</label><br><br>
                    <input v-model="newProjectData.category" type="checkbox" id="collaborations"
                        value="collaborations" />
                    <label for="collaborations">Collaborations</label><br><br>
                    <input v-model="newProjectData.category" type="checkbox" id="mandats" value="clients" />
                    <label for="mandats">Mandats</label><br>
                    <span v-if="missingCategory" class="alert-message">Il faut choisir au moins une catégorie</span>
                </div>

                <div class="input-container title-container">
                    <h3>Titre du projet</h3>
                    <h4>Français</h4>
                    <input v-model="newProjectData.title.fr" placeholder="Titre FR" style="width:90%" />

                    <h4>English</h4>
                    <input v-model="newProjectData.title.en" placeholder="Title EN" style="width:90%" /><br>
                    <span v-if="missingTitle" class="alert-message">Il manque un titre</span>
                </div>

                <div class="input-container description-container">
                    <h3>Description du projet</h3>

                    <h4>Français</h4>
                    <textarea v-model="newProjectData.description.fr" rows="5" placeholder="Description FR"></textarea>

                    <h4>English</h4>
                    <textarea v-model="newProjectData.description.en" rows="5" placeholder="Description EN"></textarea>
                </div>

                <div class="input-container photos-container">
                    <h3>Photos</h3>
                    <input @change="handleAddPhotos" id="photos" type="file" multiple accept="image/*" />
                    <label for="photos" class="custom-file-upload">Ajouter des photos</label><br>
                    <span v-if="missingPhotos" class="alert-message">Il faut ajouter au moins une photo</span>
                    <div v-if="newProjectData.photos.length" class="photo-preview-container">
                        <div v-for="(photo, index) in newProjectData.photos" :key="photo.id" v-show="!photo.toDelete"
                            class="photo-container">
                            <div class="photo-button-container">
                                <button type="button" class="infront-photo" @click="setThumbnail(index)">
                                    <font-awesome-icon v-show="thumbnailIndex !== index"
                                        icon="fa-regular fa-star" />
                                    <font-awesome-icon v-show="thumbnailIndex === index"
                                        icon="fa-solid fa-star" />
                                </button>
                                <button type="button" class="delete-photo" @click="removePhoto(photo.id)">
                                    <font-awesome-icon icon="fa-solid fa-xmark" />
                                </button>
                            </div>
                            <img :src="photo.src" alt="Preview" class="photo-preview">
                        </div>
                    </div>
                </div>

                <div class="modify-project-button-container">
                    <button type="button" class="cancel-button" @click="$emit('cancel')">Annuler</button>
                    <button type="submit" class="confirm-button">Sauvegarder</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { watchEffect, ref, onMounted } from 'vue'
import axios from 'axios'
const props = defineProps({ project: Object })

const { locale } = useI18n()

const emit = defineEmits(['updated'])

const newProjectData = ref({
    title: {
        fr: props.project.title?.fr || "",
        en: props.project.title?.en || ""
    },
    description: {
        fr: props.project.description?.fr || "",
        en: props.project.description?.en || ""
    },
    category: [...props.project.category],
    photos: props.project.photos.map((p, i) => ({
        id: `existing-${i}`,  // identifiant unique pour Vue
        src: p.url,
        type: 'existing',     // ou 'new'
        name: p.public_id,            // utile pour suppression côté serveur
        file: null,
        toDelete: false,
    })),
})

const thumbnailIndex = ref(0)

// Initialise thumbnailIndex sur montage
onMounted(() => {
    const thumb = props.project.thumbnail?.public_id
    if (thumb) {
        const index = newProjectData.value.photos.findIndex(p => p.name === thumb)
        if (index !== -1) thumbnailIndex.value = index
    }
})

function handleAddPhotos(event) {
    const files = Array.from(event.target.files)
    const newPhotos = files.map((file, i) => ({
        id: `new-${Date.now()}-${i}`,
        src: URL.createObjectURL(file),
        type: 'new',
        file,
        name: file.name,
        toDelete: false,
    }))
    newProjectData.value.photos.push(...newPhotos)

    // Si on n'avait pas de thumbnail, définir la première nouvelle comme thumbnail
    if (newProjectData.value.photos.length === newPhotos.length) {
        thumbnailIndex.value = 0
    }
}

function removePhoto(photoId) {
    const index = newProjectData.value.photos.findIndex(p => p.id === photoId)
    if (index === -1) return

    const photo = newProjectData.value.photos[index]

    if (photo.type === 'existing') {
        photo.toDelete = true
    } else {
        URL.revokeObjectURL(photo.src)
        newProjectData.value.photos.splice(index, 1)
    }

    // Ajuster thumbnailIndex si nécessaire
    if (index === thumbnailIndex.value) {
        const firstAvailable = newProjectData.value.photos.findIndex(p => !p.toDelete)
        thumbnailIndex.value = firstAvailable !== -1 ? firstAvailable : 0
    }
}

function setThumbnail(index) {
    thumbnailIndex.value = index
}

const missingCategory = ref(false)
const missingTitle = ref(false)
const missingPhotos = ref(false)
const error = ref("")

async function submitEdit() {
    missingCategory.value = newProjectData.value.category.length === 0
    missingTitle.value = !newProjectData.value.title.fr || !newProjectData.value.title.en
    missingPhotos.value = newProjectData.value.photos.every(photo => photo.toDelete)

    //test que tous les champs obligatoires sont remplis
    if (missingCategory.value || missingTitle.value || missingPhotos.value) return

    const formData = new FormData()

    formData.append("id", props.project._id)
    formData.append('title', JSON.stringify(newProjectData.value.title))
    formData.append('description', JSON.stringify(newProjectData.value.description))
    newProjectData.value.category.sort().forEach(cat => {
        formData.append("category", cat)
    })

    // nouvelles images à uploader
    newProjectData.value.photos
        .filter(p => p.type === 'new')
        .forEach(p => formData.append('newPhotos', p.file))

    // anciennes images à supprimer
    const toDelete = newProjectData.value.photos
        .filter(p => p.type === 'existing' && p.toDelete)
        .map(p => p.name)
    if (toDelete.length) {
        formData.append('deletePhotos', JSON.stringify(toDelete))
    }

    //On envoie l'index du thumbnail
    formData.append('thumbnailIndex', thumbnailIndex.value)

    const res = await axios.put(`/api/projects/updateProject`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (!res.data.success) {
        error.value = res.message;
    } else {
        emit('updated', res.data.project)
    }
}
//Pour remettre les messages d'erreur à jour
watchEffect(() => {
    if (newProjectData.value.category.length > 0) {
        missingCategory.value = false
    }
    if (newProjectData.value.title) {
        missingTitle.value = false
    }
    if (newProjectData.value.photos.length > 0) {
        missingPhotos.value = false
    }
})
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: white;
    margin: 50px;
    width: calc(100% - 100px);
    height: calc(100% - 100px);
    padding: 20px;
    border-radius: 10px;
    overflow-y: scroll;
}

.modify-project-form {
    display: flex;
    flex-direction: column;
    gap: 50px;
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

.modify-project-button-container {
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