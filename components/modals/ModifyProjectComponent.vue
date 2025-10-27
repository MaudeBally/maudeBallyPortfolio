<template>
    <div class="overlay">
        <div class="modal">
            <h1>{{ project.title }}</h1>
            <div class="button-container">
                <button @click="$emit('cancel')">Annuler</button>
                <button @click="$emit('save')" class="save">Sauvegarder</button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({ project: Object })
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
}

button {
    cursor: pointer;
}
</style>