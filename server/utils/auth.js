import User from '~/server/models/User'
import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'

export async function getCurrentUser(event) {
  // Exemple avec un token stocké dans un cookie 'token'
  const token = getCookie(event, 'token')
  if (!token) return null

  const config = useRuntimeConfig()
  try {
    const payload = jwt.verify(token, config.jwt_secret)
    return payload
  } catch (err) {
    return null
  }
}
