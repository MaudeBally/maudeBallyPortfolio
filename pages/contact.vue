<template>
    <div class="contact-page">
        <NuxtLink class="go-back-button" :to="`/${locale}`">{{ $t('divers.close') }}</NuxtLink>
        <div class="biography-section">
            <div class="biography-text">
                {{ personalData.biography[locale] }}
            </div>
            <img class="random-image" :src="getPhotoUrl" alt="">
        </div>
        <div class="contact-info-container">
            <span>{{ personalData.phone }}</span>
            <span><a :href="`https://www.instagram.com/${personalData.insta?.substring(1)}/`" target="_blank">{{ personalData.insta }}</a></span>
            <span><a :href="`mailto:${personalData.mail}`">{{ personalData.email }}</a></span>
        </div>
    </div>
</template>

<script setup>
const { locales, setLocale, locale } = useI18n()

const store = useProjectsStore()
await store.fetchProjects()

const randomProjectNumber = computed(() => {
    return randomIntFromInterval(0, store.projects.length - 1)
})

const randomPhotoFromProject = computed(() => {
    return randomIntFromInterval(0, store.projects[randomProjectNumber.value].photos.length - 1)
})

const getPhotoUrl = computed(() => {
    return store.projects[randomProjectNumber.value].photos[randomPhotoFromProject.value].url
})

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


const personalData = ref({
    biography: {
        fr: '',
        en: ''
    }
})
onMounted(async () => {
    try {
        const res = await $fetch("/api/personalData/getAllPersonalData")
        personalData.value = res.personalData[0] || {}
    } catch (err) {
        console.error("Erreur chargement personalData:", err)
    }
})
</script>

<style scoped>
.contact-page {
    width: 100%;
    display: flex;
    flex-direction: column;
    min-height: calc(100dvh - 100px);
    gap: 50px;
}

.go-back-button {
    text-decoration: none;
    color: brown;
    position: absolute;
    right: 32px;
}

/* -------------------- BIOGRAPHY SECTION ----------------- */
.biography-section {
    display: flex;
    width: 100%;
    flex: 1;
    gap: 50px;
    justify-content: center;
    align-items: center;
}

.biography-text {
    width: 300px;
}

.random-image {
    width: 200px;
}

/* -------------------- CONTACT SECTION ------------------ */
.contact-info-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding-bottom: 100px;
}

.contact-info-container * {
    text-decoration: none;
    color: brown;
}

@media (max-width: 560px) {
    .biography-section {
        flex-direction: column;
        margin-top: 50px;
    }

    .contact-info-container {
        padding-bottom: 50px;
    }
}
</style>