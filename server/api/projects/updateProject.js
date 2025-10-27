// ~/server/api/projects/updater.ts
import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'
import slugify from 'slugify'
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
                const title = fields.title?.[0] || project.title
                const description = fields.description?.[0] || project.description
                const categories = fields.category || project.category
                const deletePhotos = fields.deletePhotos ? JSON.parse(fields.deletePhotos[0]) : []
                const thumbnail = fields.thumbnail?.[0] || project.thumbnail

                project.title = title
                project.description = description
                project.category = categories
                project.thumbnail = thumbnail

                const projectDir = path.join('./public/projects', projectId)
                if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true })

                // Suppression des anciennes photos
                if (deletePhotos.length) {
                    project.photos = project.photos.filter(filename => {
                        if (deletePhotos.includes(filename)) {
                            const filePath = path.join(projectDir, filename)
                            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
                            return false
                        }
                        return true
                    })
                }

                // Ajout des nouvelles photos
                if (files.newPhotos) {
                    const uploadedFiles = []
                    const fileArray = Array.isArray(files.newPhotos) ? files.newPhotos : [files.newPhotos]

                    fileArray.forEach(file => {
                        const originalName = file.originalFilename || file.newFilename
                        const extension = path.extname(originalName)
                        const baseName = path.basename(originalName, extension)
                        const safeName = slugify(baseName, { lower: true, strict: true })
                        const finalName = `${Date.now()}-${safeName}${extension}`
                        const newPath = path.join(projectDir, finalName)
                        fs.renameSync(file.filepath, newPath)

                        if (originalName === thumbnail) {
                            project.thumbnail = finalName
                        }
                        uploadedFiles.push(finalName)
                    })

                    project.photos.push(...uploadedFiles)
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
