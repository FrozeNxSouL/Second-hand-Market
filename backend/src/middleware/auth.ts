import { jwt } from 'hono/jwt'

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET!,
  alg: 'HS256'
})

export { authMiddleware as auth }