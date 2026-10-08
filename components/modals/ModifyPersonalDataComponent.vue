<template>
    <div class="overlay">
        <div class="modal">
            <h1>Biographie / Contact</h1>
            <form class="modify-personalData-form" @submit.prevent="submitEdit()">

                <div class="input-container email-container">
                    <h3>Email</h3>
                    <input v-model="newPersonalData.email" placeholder="Email" style="width:90%">
                </div>

                <div class="input-container insta-container">
                    <h3>instagram</h3>
                    <input v-model="newPersonalData.insta" placeholder="Instagram" style="width:90%">
                </div>

                <div class="input-container phone-container">
                    <h3>Téléphone</h3>
                    <input v-model="newPersonalData.phone" placeholder="Téléphone" style="width:90%">
                </div>

                <div class="input-container biography-container">
                    <h3>Biographie</h3>
                    <h4>Français</h4>
                    <input v-model="newPersonalData.biography.fr" placeholder="Biographie FR" style="width:90%" />

                    <h4>English</h4>
                    <input v-model="newPersonalData.biography.en" placeholder="Biographie EN" style="width:90%" /><br>
                </div>

                <div class="modify-personalData-button-container">
                    <button type="button" class="cancel-button" @click="$emit('cancel')">Annuler</button>
                    <button type="submit" class="confirm-button">Sauvegarder</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ personalData: Object })

const emit = defineEmits(['updated'])

const newPersonalData = ref({
    email: props.personalData.email,
    insta: props.personalData.insta,
    phone: props.personalData.phone,
    biography: {
        fr: props.personalData.biography?.fr || "",
        en: props.personalData.biography?.en || ""
    }
})


const error = ref("")

async function submitEdit() {
    const payload = {
        id: props.personalData._id,
        email: newPersonalData.value.email,
        insta: newPersonalData.value.insta,
        phone: newPersonalData.value.phone,
        biography: newPersonalData.value.biography
    }

    const res = await $fetch('/api/personalData/updatePersonalData', {
        method: 'POST',
        body: payload
    })

    if (!res.success) {
        error.value = res.message
    } else {
        emit('updated', res.personalData)
    }
}
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

.modify-personalData-form {
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

.modify-personalData-button-container {
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