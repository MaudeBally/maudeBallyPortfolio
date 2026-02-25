import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
import { getCurrentUser } from '~/server/utils/auth'
import { v2 as cloudinary } from 'cloudinary'

export default defineEventHandler(async (event) => {
    try {
        await connectDB()

        const user = await getCurrentUser(event)
        if (!user) return { success: false, message: "Pas d'utilisateur trouvé" }

        // Vérifie que l'utilisateur est propriétaire ou admin
        if (user.role !== "admin") {
            return { success: false, message: "Pas les droits..." }
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

        const folder = `projects/${project.slug}`

        // Supprime les fichiers images
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
        })
        // Supprime toutes les images du dossier
        await cloudinary.api.delete_resources_by_prefix(folder)

        // Supprime le dossier lui-même
        await cloudinary.api.delete_folder(folder)

        // Supprime le projet de la BDD
        await Project.deleteOne({ _id: projectId })

        return { success: true, message: 'Projet supprimé avec succès' }

    } catch (err) {
        console.error('Erreur suppression projet:', err)
        return { success: false, message: 'Erreur serveur' }
    }
})