import { MiddlewareHandler } from 'hono'
import { Context } from 'hono'

export const errorMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    await next()
  } catch (error: any) {
    console.error('Error:', error)
    return c.json({ error: error.message || 'Internal server error' }, 500)
  }
}