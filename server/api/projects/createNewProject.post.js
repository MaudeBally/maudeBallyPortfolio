import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'
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

    const body = await readBody(event)
    const { title, description, category, images, thumbnailIndex } = body

    if (!title?.fr || !title?.en) return { success: false, message: 'Titre FR et EN requis' }
    if (!category?.length) return { success: false, message: 'Categorie requise' }
    if (!images?.length) return { success: false, message: 'Photos requises' }

    // Générer slug unique
    let slug = slugify(title.fr, { lower: true, strict: true })
    let counter = 1
    while (await Project.findOne({ slug })) slug = `${slug}-${counter++}`

    // Créer les objets { url, public_id } pour les images
    const photos = images.map(img => ({
      url: img.url,
      public_id: img.public_id || null
    }))

    // Déterminer le thumbnail
    const thumbnail = photos[thumbnailIndex] || photos[0]

    const newProject = new Project({
      slug,
      title,
      description,
      category,
      photos,
      thumbnail,
      createdAt: new Date()
    })

    const savedProject = await newProject.save()
    return { success: true, project: savedProject }

  } catch (err) {
    console.error('Erreur création projet:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la création du projet',
    })
  }
})
