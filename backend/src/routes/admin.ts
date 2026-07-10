import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import prisma from '../lib/prisma'

const admin = new Hono()

// Middleware: only managers
admin.use('*', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }))

// Check if user is manager
const requireManager = async (c: any, next: any) => {
  const user = c.get('jwtPayload')
  if (user.role !== 'manager') {
    return c.json({ error: 'Forbidden - manager only' }, 403)
  }
  await next()
}

admin.use('/users*', requireManager)
admin.use('/reports*', requireManager)
admin.use('/categories*', requireManager)

// Get all users
admin.get('/users', async (c) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      score: true,
      role: true,
    }
  })
  return c.json(users)
})

// Ban/unban user
admin.put('/users/:id', async (c) => {
  const id = c.req.param('id')
  const { role } = await c.req.json()

  const user = await prisma.user.update({
    where: { id },
    data: { role }
  })

  return c.json(user)
})

// Get all reports
admin.get('/reports', async (c) => {
  const reports = await prisma.report.findMany({
    include: {
      reportedUser: {
        select: { id: true, name: true, email: true }
      }
    }
  })
  return c.json(reports)
})

// Update report status
admin.put('/reports/:id', async (c) => {
  const id = c.req.param('id')
  const { reportStatus } = await c.req.json()

  const report = await prisma.report.update({
    where: { id },
    data: { reportStatus }
  })

  return c.json(report)
})

// Get categories
admin.get('/categories', async (c) => {
  const management = await prisma.management.findFirst()
  return c.json(management?.categorys || [])
})

// Add category
admin.post('/categories', async (c) => {
  const { name, url } = await c.req.json()

  let management = await prisma.management.findFirst()

  if (!management) {
    management = await prisma.management.create({
      data: { tax: 0, categorys: [] }
    })
  }

  const updated = await prisma.management.update({
    where: { id: management.id },
    data: {
      categorys: {
        push: { name, url }
      }
    }
  })

  return c.json(updated)
})

// Update tax
admin.put('/tax', async (c) => {
  const { tax } = await c.req.json()

  let management = await prisma.management.findFirst()

  if (!management) {
    management = await prisma.management.create({
      data: { tax, categorys: [] }
    })
  } else {
    management = await prisma.management.update({
      where: { id: management.id },
      data: { tax }
    })
  }

  return c.json(management)
})

// Edit/Delete category
admin.put('/categories/:id', async (c) => {
  const id = c.req.param('id')
  const { name, url } = await c.req.json()
  const cat = await prisma.category.update({
    where: { id },
    data: { name, url }
  })
  return c.json(cat)
})

admin.delete('/categories/:id', async (c) => {
  const id = c.req.param('id')
  await prisma.category.delete({ where: { id } })
  return c.json({ success: true })
})

export default admin