import connectDB from '~/server/db/index'
import PersonalData from '~/server/models/PersonalData'

export default defineEventHandler(async (event) => {
    await connectDB();
    try {
        const personalData = await PersonalData.find()
        if (!personalData) {
            return { success: false, message: "Projet introuvable" }
        }
        return {
            success: true,
            count: personalData.length,
            personalData: personalData,
        }
    } catch (err) {
        console.error(err);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des personalData',
        });
    }
});