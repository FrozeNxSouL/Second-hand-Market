import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import prisma from '../lib/prisma'

const category = new Hono()

category.get('/', async (c) => {
  const list = await prisma.category.findMany();

  return c.json(list)
})

export default category