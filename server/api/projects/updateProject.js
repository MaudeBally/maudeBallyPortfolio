// ~/server/api/projects/updater.ts
import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
import formidable from 'formidable'
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

        // Lecture du formulaire
        const form = formidable({ multiples: true })

        return new Promise((resolve, reject) => {
            form.parse(event.node.req, async (err, fields, files) => {
                if (err) return reject(err)

                const projectId = fields.id?.[0] || fields.id
                if (!projectId || !isValidObjectId(projectId)) {
                    return resolve({ success: false, message: 'ID du projet invalide' })
                }

                const project = await Project.findById(projectId)
                if (!project) return resolve({ success: false, message: 'Projet introuvable' })

                // Champs à mettre à jour
                let title = project.title
                if (fields.title) {
                    const rawTitle = fields.title[0] || fields.title
                    title = JSON.parse(rawTitle)
                }
                if (!title.fr || !title.en) {
                    return resolve({ success: false, message: "Titre incomplet (FR et EN requis)" })
                }
                // Regénération automatique du slug si le titre FR change
                if (title.fr !== project.title.fr) {
                    let newSlug = slugify(title.fr, { lower: true, strict: true })
                    let counter = 1

                    // Évite les collisions
                    while (await Project.findOne({ slug: newSlug, _id: { $ne: project._id } })) {
                        newSlug = `${newSlug}-${counter++}`
                    }

                    project.slug = newSlug
                }

                let description = project.description
                if (fields.description) {
                    const rawDescription = fields.description[0] || fields.description
                    description = JSON.parse(rawDescription)
                }

                const categories = fields.category || project.category

                project.title = title
                project.description = description
                project.category = categories

                // Suppression des anciennes photos
                const deletePhotos = fields.deletePhotos ? JSON.parse(fields.deletePhotos[0]) : []
                if (deletePhotos.length) {
                    project.photos = project.photos.filter(photo => {
                        if (deletePhotos.includes(photo.public_id)) {
                            cloudinary.uploader.destroy(photo.public_id)
                            return false
                        }
                        return true
                    })
                }

                // Ajout des nouvelles photos
                if (files.newPhotos) {
                    const fileArray = Array.isArray(files.newPhotos) ? files.newPhotos : [files.newPhotos]
                    for (const file of fileArray) {
                        const upload = await cloudinary.uploader.upload(file.filepath, {
                            folder: `projects/${projectId}`,
                            resource_type: "image",
                            transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
                        })
                        project.photos.push({ url: upload.secure_url, public_id: upload.public_id })
                    }
                }

                //Gestion thumbnail
                const thumbnailIndex = parseInt(fields.thumbnailIndex?.[0] || fields.thumbnailIndex)
                if (!isNaN(thumbnailIndex) && project.photos[thumbnailIndex]) {
                    project.thumbnail = project.photos[thumbnailIndex]
                }

                // Sauvegarde finale
                const updatedProject = await project.save()
                resolve({ success: true, project: updatedProject })
            })
        })
    } catch (err) {
        console.error('Erreur modification projet:', err)
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || 'Erreur lors de la modification du projet',
        })
    }
})
