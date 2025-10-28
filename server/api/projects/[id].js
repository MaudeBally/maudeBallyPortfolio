import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'

export default defineEventHandler(async (event) => {
    await connectDB();

    // Récupère l'id depuis l'URL
    const { id } = event.context.params
    try {
        const project = Project.find((p) => p._id === id)
        if (!project) {
            return { success: false, message: "Projet introuvable" }
        }
        return {
            success: true,
            project: project,
        }

    } catch (err) {
        console.error(err);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des projets',
        });
    }
})