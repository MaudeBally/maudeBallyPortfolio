// ~/server/api/projects/updater.ts
import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
import slugify from 'slugify'
import { isValidObjectId } from 'mongoose'
import { getCurrentUser } from '~/server/utils/auth'
import { v2 as cloudinary } from 'cloudinary'

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

        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_API_SECRET,
        })

        const body = await readBody(event)

        const {
            id,
            title,
            description,
            category,
            photos,        //nouvelles photos déjà uploadées (url + public_id)
            deletePhotos,  //array de public_id
            thumbnailIndex
        } = body

        if (!id || !isValidObjectId(id)) {
            return { success: false, message: "ID du projet invalide" }
        }

        const project = await Project.findById(id)
        if (!project) {
            return { success: false, message: "Projet introuvable" }
        }

        //Validation titre
        if (!title?.fr || !title?.en) {
            return { success: false, message: "Titre incomplet (FR et EN requis)" }
        }

        //Recalculer le slug si nécessaire
        if (title.fr !== project.title.fr) {
            let baseSlug = slugify(title.fr, { lower: true, strict: true })
            let finalSlug = baseSlug
            let counter = 1

            while (
                await Project.findOne({
                    slug: finalSlug,
                    _id: { $ne: project._id }
                })
            ) {
                finalSlug = `${baseSlug}-${counter++}`
            }

            project.slug = finalSlug
        }

        //Supression cloudinary
        if (deletePhotos && deletePhotos.length) {
            await Promise.all(
                deletePhotos.map((publicId) =>
                    cloudinary.uploader.destroy(publicId)
                )
            )

            project.photos = project.photos.filter(
                (photo) => !deletePhotos.includes(photo.public_id)
            )
        }

        //Ajout des nouvelles photos pour la DB
        if (photos && photos.length) {
            project.photos.push(...photos)
        }

        //Mise à jour des champs
        project.title = title
        project.description = description
        project.category = category

        //Gestion du thumbnail
        if (
            typeof thumbnailIndex === "number" &&
            project.photos[thumbnailIndex]
        ) {
            project.thumbnail = project.photos[thumbnailIndex]
        }

        //Save
        const updateProject = await project.save()

        return {
            success: true,
            project: updateProject
        }
    } catch (err) {
        console.error('Erreur modification projet:', err)
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || 'Erreur lors de la modification du projet',
        })
    }
})
