import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import prisma from '../lib/prisma'

const orders = new Hono()

// Get orders for the logged-in user (either as buyer or seller)
orders.get('/', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')

  const orders = await prisma.transaction.findMany({
    where: {
      userId: user.id
    },
    include: {
      product: true
    },
    orderBy: {
      create_transaction_date: 'desc'
    }
  })

  return c.json(orders)
})

// Get a single order
orders.get('/:id', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const id = c.req.param('id')
  const user = c.get('jwtPayload')

  const order = await prisma.transaction.findUnique({
    where: { id },
    include: {
      product: true,
      user: { select: { id: true, name: true, phone: true } }
    }
  })

  if (!order) return c.json({ error: 'Order not found' }, 404)

  // Only the buyer or product owner can view (or admin)
  if (order.userId !== user.id && user.role !== 'manager') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  return c.json(order)
})

// Get order as seller (products you sold)
orders.get('/sold', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')

  const soldProducts = await prisma.product.findMany({
    where: {
      userId: user.id,
      status: 'finished'
    },
    include: {
      Transaction: true
    }
  })

  return c.json(soldProducts)
})

// Update product status (mark as shipped, etc.)
orders.put('/product/:productId/status', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')
  const productId = c.req.param('productId')
  const { status } = await c.req.json()

  const product = await prisma.product.findUnique({
    where: { id: productId }
  })

  if (!product) return c.json({ error: 'Product not found' }, 404)
  if (product.userId !== user.id) return c.json({ error: 'Unauthorized' }, 403)

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { status }
  })

  return c.json(updated)
})

export default orders