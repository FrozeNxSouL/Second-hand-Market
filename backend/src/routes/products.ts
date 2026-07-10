import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import prisma from '../lib/prisma'

const products = new Hono()

// Public routes
products.get('/', async (c) => {
  const products = await prisma.product.findMany({
    where: {
      status: { in: ['sell', 'finished', 'expired'] }
    },
    include: {
      User: {
        select: { id: true, name: true, picture: true, score: true }
      },
      auction: true
    }
  })
  return c.json(products)
})

products.get('/search', async (c) => {
  const query = c.req.query('q')
  const tag = c.req.query('tag')
  
  const products = await prisma.product.findMany({
    where: {
      status: { in: ['sell', 'finished', 'expired'] },
      ...(query ? {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ]
      } : {}),
      ...(tag ? { tag: { has: tag } } : {})
    },
    include: { User: true }
  })
  return c.json(products)
})

products.get('/:id', async (c) => {
  const id = c.req.param('id')
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      User: {
        select: { id: true, name: true, picture: true, score: true }
      },
      auction: {
        include: {
          user: { select: { name: true } },
          auction_log: true
        }
      }
    }
  })
  if (!product) return c.json({ error: 'Product not found' }, 404)
  return c.json(product)
})

// Protected routes
products.post('/', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')
  const body = await c.req.json()

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl || [],
      tag: body.tag || [],
      status: body.status || 'sell',
      userId: user.id,
      score: 0
    }
  })

  return c.json(product, 201)
})

products.put('/:id', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')
  const id = c.req.param('id')
  const body = await c.req.json()

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) return c.json({ error: 'Product not found' }, 404)
  if (product.userId !== user.id) return c.json({ error: 'Unauthorized' }, 403)

  const updated = await prisma.product.update({
    where: { id },
    data: body
  })

  return c.json(updated)
})

products.delete('/:id', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')
  const id = c.req.param('id')

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) return c.json({ error: 'Product not found' }, 404)
  if (product.userId !== user.id && user.role !== 'manager') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  await prisma.product.delete({
    where: { id }
  })

  return c.json({ success: true })
})

export default products