import connectDB from '~/server/db/index'
import Project from '~/server/models/Project'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const body = await readBody(event)

    // Vérification des champs obligatoires
    if (!body.category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le champ "Catégorie" est requis',
      })
    }
    if (!body.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le champ "Titre" est requis',
      })
    }
    if (!body.photos) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le champ "Photos" est requis',
      })
    }

    const newProject = new Project({
      category: body.category,
      title: body.title,
      description: body.description || '',
      photos: body.photos,
      createdAt: new Date(),
    })

    const savedProject = await newProject.save()

    return {
      success: true,
      message: 'Projet créé avec succès ✅',
      project: savedProject,
    }
  } catch (err) {
    console.error('Erreur création projet:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la création du projet',
    })
  }
})
