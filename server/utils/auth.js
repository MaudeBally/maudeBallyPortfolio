import User from '~/server/models/User'
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

export async function getCurrentUser(event) {
  // Exemple avec un token stocké dans un cookie 'token'
  const token = getCookie(event, 'token')
  if (!token) return null

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload
  } catch (err) {
    return null
  }
}
