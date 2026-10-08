// ~/server/api/personalData/updater.ts
import connectDB from '~/server/db/index'
import PersonalData from '~/server/models/PersonalData'
import { isValidObjectId } from 'mongoose'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        await connectDB()

        // Authentification
        const user = await getCurrentUser(event)
        if (!user) return { success: false, message: "utilisateur introuvable" }

        // Vérifie que l'utilisateur est propriétaire ou admin
        if (user.role !== "admin") {
            return { success: false, message: "Pas les droits..." }
        }

        const body = await readBody(event)

        const {
            id,
            email,
            insta,
            phone,
            biography
        } = body

        if (!id || !isValidObjectId(id)) {
            return { success: false, message: "Pas trouvé les infos personnelles invalide" }
        }

        const personalData = await PersonalData.findById(id)
        if (!personalData) {
            return { success: false, message: "PersonalData introuvable" }
        }

        //Mise à jour des champs
        personalData.email = email
        personalData.insta = insta
        personalData.phone = phone
        personalData.biography = biography

        //Save
        const updatePersonalData = await personalData.save()

        return {
            success: true,
            personalData: updatePersonalData
        }
    } catch (err) {
        console.error('Erreur modification personalData:', err)
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || 'Erreur lors de la modification du personalData',
        })
    }
})
