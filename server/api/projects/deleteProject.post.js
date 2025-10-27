import fs from 'fs'
import path from 'path'
import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        await connectDB()

        const user = await getCurrentUser(event)
        if (!user) return {success: false, message: "Pas d'utilisateur trouvé"}

        // Vérifie que l'utilisateur est propriétaire ou admin
        if (user.role !== "admin") {
            return {success: false, message: "Pas les droits..."}
        }

        const body = await readBody(event)
        const projectId = body.projectId

        if (!projectId) {
            return { success: false, message: 'Project ID manquant' }
        }

        // Cherche le projet
        const project = await Project.findById(projectId)
        if (!project) {
            return { success: false, message: 'Projet non trouvé' }
        }

        // Supprime les fichiers dans /public/projects/{projectId}
        const projectDir = path.join('./public/projects', projectId)
        if (fs.existsSync(projectDir)) {
            fs.rmSync(projectDir, { recursive: true, force: true })
        }

        // Supprime le projet de la BDD
        await Project.deleteOne({ _id: projectId })

        return { success: true, message: 'Projet supprimé avec succès' }

    } catch (err) {
        console.error('Erreur suppression projet:', err)
        return { success: false, message: 'Erreur serveur' }
    }
})