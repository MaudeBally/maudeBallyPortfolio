import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'
import slugify from 'slugify'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const user = await getCurrentUser(event)
    if (!user) return { success: false, message: "Pas d'utilisateur trouvé" }

    // Vérifie que l'utilisateur est propriétaire ou admin
    if (user.role !== "admin") {
      return { success: false, message: "Pas les droits..." }
    }

    const form = formidable({ multiples: true })

    return new Promise((resolve, reject) => {
      form.parse(event.node.req, async (err, fields, files) => {
        if (err) return reject(err)

        if (!fields.title) {
          return resolve({ success: false, message: 'Titre requis' })
        }

        let parsedTitle
        let parsedDescription = undefined

        try {
          parsedTitle = JSON.parse(fields.title[0] || fields.title)

          if (fields.description) {
            parsedDescription = JSON.parse(fields.description[0] || fields.description)
          }
        } catch (err) {
          return resolve({ success: false, message: 'Format JSON invalide' })
        }

        if (!parsedTitle.fr || !parsedTitle.en) {
          return resolve({ success: false, message: 'Titre FR et EN requis' })
        }
        const categories = fields.category
        const thumbnail = fields.thumbnail

        if (!categories.length) return resolve({ success: false, message: 'Categorie requise' })
        if (!files.photos) return resolve({ success: false, message: 'Photos requises' })

        // Créer projet dans la BDD
        const newProject = new Project({
          title: parsedTitle,
          description: parsedDescription,
          category: categories,
          photos: [],
          thumbnail: thumbnail[0],
          createdAt: new Date()
        })

        const savedProject = await newProject.save()
        const projectId = savedProject._id.toString()

        const projectDir = path.join('./public/projects', projectId)
        if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true })

        const uploadedFiles = []
        const fileArray = Array.isArray(files.photos) ? files.photos : [files.photos]

        fileArray.forEach(file => {
          const originalName = file.originalFilename || file.newFilename
          const extension = path.extname(originalName)
          const baseName = path.basename(originalName, extension)

          // Crée un nom safe pour le fichier
          const safeName = slugify(baseName, { lower: true, strict: true })
          const finalName = `${Date.now()}-${safeName}${extension}`

          const newPath = path.join(projectDir, finalName)
          fs.renameSync(file.filepath, newPath)

          if (originalName === newProject.thumbnail) {
            savedProject.thumbnail = finalName
          }

          uploadedFiles.push(finalName)
        })

        savedProject.photos = uploadedFiles
        await savedProject.save()

        resolve({ success: true, project: savedProject })
      })
    })

  } catch (err) {
    console.error('Erreur création projet:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la création du projet',
    })
  }
})
