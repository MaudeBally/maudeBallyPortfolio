<template>
    <div class="login-container">
        <h1>Connexion Admin</h1>
        <form @submit.prevent="login">
            <input v-model="username" placeholder="Nom d'utilisateur" />
            <input v-model="password" type="password" placeholder="Mot de passe" />
            <button type="submit">Se connecter</button>
        </form>
        <p v-show="error">Utilisateur ou Mot de passe incorrect!</p>
    </div>
</template>

<style scoped>
.login-container {
    width: 100%;
    height: calc(100dvh - 5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3rem;
}
form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
p {
    margin-top: 2rem;
}
</style>

<script setup>
import { ref } from "vue";

definePageMeta({
    layout: 'none'
})

const username = ref("");
const password = ref("");
const error = ref("");

async function login() {
    const res = await $fetch("/api/login", {
        method: "POST",
        body: { username: username.value, password: password.value }
    });

    if (!res.success) {
        error.value = res.message;
    } else {
        navigateTo("/adminInterface");
    }
}
</script>