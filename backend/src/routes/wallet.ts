import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import prisma from '../lib/prisma'

const wallet = new Hono()

wallet.use('*', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }))

// Get my wallet
wallet.get('/', async (c) => {
  const user = c.get('jwtPayload') as any
  const w = await prisma.wallet.findFirst({
    where: { userId: user.id }
  })
  return c.json(w || { cash: 0 })
})

// Add funds to my wallet
wallet.put('/', async (c) => {
  const user = c.get('jwtPayload') as any
  const { cash } = await c.req.json()

  let w = await prisma.wallet.findFirst({ where: { userId: user.id } })
  if (!w) {
    w = await prisma.wallet.create({
      data: { creditCard: '', cash: cash || 0, userId: user.id }
    })
  } else {
    w = await prisma.wallet.update({
      where: { id: w.id },
      data: { cash: (w.cash || 0) + (cash || 0) }
    })
  }
  return c.json(w)
})

// Add scoring + reports route
const report = new Hono()

report.use('*', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }))

report.post('/', async (c) => {
  const user = c.get('jwtPayload') as any
  const { reportDescription, reportSelection, reportPicture, userId } = await c.req.json()

  const r = await prisma.report.create({
    data: {
      reportPicture: reportPicture || [],
      reportDescription,
      reportStatus: '1',
      reportingUserID: user.id,
      reportSelection: reportSelection || [],
      userId,
    }
  })
  return c.json(r, 201)
})

export { wallet, report }