import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'

export default defineEventHandler(async (event) => {
    await connectDB();
    try {
        const projects = await Project.find()
        if (!projects) {
            return { success: false, message: "Projet introuvable" }
        }
        return {
            success: true,
            count: projects.length,
            projects: projects.reverse(),
        }
    } catch (err) {
        console.error(err);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des projets',
        });
    }
});