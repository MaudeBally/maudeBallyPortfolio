import { defineStore } from 'pinia'

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: [],
        fetched: false,

        activeCategory: null,
        activeProject: null,
    }),

    getters: {
        // Récupère la liste de toutes les catégories uniques
        categories(state) {
            const allCats = state.projects.flatMap(p => p.category)
            return [...new Set(allCats)].sort()
        },

        // Renvoie un objet { catégorie: [projets] }
        projectsByCategory(state) {
            const grouped = {}
            state.projects.forEach(project => {
                project.category.forEach(cat => {
                    if (!grouped[cat]) grouped[cat] = []
                    grouped[cat].push(project)
                })
            })
            return grouped
        },

        filteredProjects(state) {
            if (!state.activeCategory) return state.projects
            return state.projects.filter(p => p.category.includes(state.activeCategory))
        },
    },

    actions: {
        async fetchProjects() {
            if (this.fetched) return
            try {
                const res = await $fetch("/api/projects/getAllProjects")
                this.projects = res.projects || []
                this.fetched = true
            } catch (err) {
                console.error("Erreur chargement projets:", err)
            }
        },

        setCategory(category) {
            // si on clique sur la même catégorie → on la désactive
            this.activeCategory = this.activeCategory === category ? null : category
        },

        setProject(project) {
            this.activeProject = project
        },
    },
})