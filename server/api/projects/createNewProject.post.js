import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
import formidable from 'formidable'
import slugify from 'slugify'
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

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    })

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

        if (!categories.length) return resolve({ success: false, message: 'Categorie requise' })
        if (!files.photos) return resolve({ success: false, message: 'Photos requises' })

        // Créer projet dans la BDD
        let slug = slugify(parsedTitle.fr, { lower: true, strict: true })
        let counter = 1

        while (await Project.findOne({ slug })) {
          slug = `${slug}-${counter++}`
        }
        const newProject = new Project({
          slug: slug,
          title: parsedTitle,
          description: parsedDescription,
          category: categories,
          photos: [],
          thumbnail: null,
          createdAt: new Date()
        })

        const savedProject = await newProject.save()
        const projectSlug = savedProject.slug.toString()

        const uploadedFiles = []
        const fileArray = Array.isArray(files.photos) ? files.photos : [files.photos]

        const thumbnailIndex = parseInt(fields.thumbnailIndex?.[0] || fields.thumbnailIndex || 0)

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i]
          const originalName = file.originalFilename || file.newFilename
          const extension = originalName.split('.').pop()
          const baseName = originalName.replace(`.${extension}`, '')

          const safeName = slugify(baseName, { lower: true, strict: true })

          const uploadResult = await cloudinary.uploader.upload(
            file.filepath,
            {
              folder: `projects/${projectSlug}`,
              public_id: `${Date.now()}-${safeName}`,
              resource_type: "image"
            }
          )

          const imageData = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
          }

          uploadedFiles.push(imageData)

          if (i === thumbnailIndex) {
            savedProject.thumbnail = imageData
          }
        }

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
