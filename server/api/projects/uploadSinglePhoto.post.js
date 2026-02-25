import formidable from "formidable"
import { v2 as cloudinary } from "cloudinary"
import { getCurrentUser } from "~/server/utils/auth"

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)

  if (!user || user.role !== "admin") {
    return { success: false, message: "Pas les droits" }
  }

  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  })

  const form = formidable({ multiples: false })

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) return reject(err)

      if (!files.photo) {
        return resolve({ success: false, message: "Photo manquante" })
      }

      const file = Array.isArray(files.photo)
        ? files.photo[0]
        : files.photo

      try {
        const result = await cloudinary.uploader.upload(
          file.filepath,
          {
            folder: "projects",
            resource_type: "image"
          }
        )

        resolve({
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        })

      } catch (error) {
        reject(error)
      }
    })
  })
})