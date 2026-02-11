<template>
    <div class="overlay">
        <div class="modal">
            <p>Voulez-vous vraiment supprimer {{ project.title[locale] }} ?</p>
            <div class="button-container">
                <button @click="$emit('cancel')">Annuler</button>
                <button @click="$emit('confirm')" class="delete">Supprimer</button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({ project: Object })

const { locale } = useI18n()
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
    padding: 20px;
    border-radius: 10px;
}

p {
    margin-bottom: 20px;
}

.button-container {
    display: flex;
    gap: 15px;
    justify-content: center;
}

button {
    cursor: pointer;
}

.delete {
    color: red;
}
</style>
