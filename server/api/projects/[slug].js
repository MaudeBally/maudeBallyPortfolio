import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'

export default defineEventHandler(async (event) => {
    await connectDB();

    // Récupère le slug depuis l'URL
    const { slug } = event.context.params
    try {
        const project = await Project.findOne({ slug })
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