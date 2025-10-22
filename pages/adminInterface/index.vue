<template>
    <div>
        <h1>Maude Bally's Dashboard</h1>

        <div class="projects-container">
            
        </div>
    </div>
</template>

<script setup>
const { user } = await $fetch("/api/me");
const { projects } = await $fetch("/api/projects/getAllProjects")

console.log(user)
console.log(projects)

definePageMeta({
    layout: 'none'
})


</script>

<style scoped>

</style>