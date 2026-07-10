import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import prisma from '../lib/prisma'

const auth = new Hono()

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400)
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  if (user.role === 'deleted') {
    return c.json({ error: 'Account has been banned' }, 403)
  }

  const passwordValid = await bcrypt.compare(password, user.hashedPassword)

  if (!passwordValid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = jsonwebtoken.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  return c.json({ 
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      picture: user.picture,
      score: user.score,
    }
  })
})

auth.post('/register', async (c) => {
  const { email, password, name, phone } = await c.req.json()

  const hashPass = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        name: name || 'New User',
        email,
        hashedPassword: hashPass,
        address: [],
        phone: phone || '',
        score: 0,
        role: 'user',
        picture: 'https://mpics.mgronline.com/pics/Images/557000005527401.JPEG',
        wallet: {
          create: {
            creditCard: '',
            cash: 0
          }
        }
      }
    })

    const token = jsonwebtoken.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return c.json({ token }, 201)
  } catch (e) {
    console.error(e)
    return c.json({ error: 'Registration failed' }, 400)
  }
})

auth.get('/me', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  return c.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    picture: user.picture,
    score: user.score,
  })
})

export default auth

// Protected user profile routes
const profile = new Hono()

profile.use('*', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }))

profile.put('/address', async (c) => {
  const user = c.get('jwtPayload')
  const { address } = await c.req.json()

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { address }
    })
    return c.json({ message: 'Address updated successfully' })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

profile.put('/', async (c) => {
  const user = c.get('jwtPayload') as any
  const { name, email, phone, picture } = await c.req.json()

  const data: any = {}
  if (email) data.email = email
  if (name) data.name = name
  if (phone) data.phone = phone
  if (picture) data.picture = picture

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data
    })
    return c.json({ message: 'Profile updated successfully', user: updated })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

profile.put('/password', async (c) => {
  const user = c.get('jwtPayload')
  const { currentPassword, newPassword, repeatPassword } = await c.req.json()

  if (!currentPassword) return c.json({ error: 'Please enter current password' }, 400)
  if (!newPassword) return c.json({ error: 'Please enter new password' }, 400)
  if (!repeatPassword) return c.json({ error: 'Please enter repeat password' }, 400)
  if (newPassword !== repeatPassword) return c.json({ error: 'Passwords do not match' }, 400)

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { hashedPassword: true }
  })

  if (!dbUser) return c.json({ error: 'User not found' }, 404)

  const isMatch = await bcrypt.compare(currentPassword, dbUser.hashedPassword)
  if (!isMatch) return c.json({ error: 'Current password is incorrect' }, 400)

  const hashedNewPassword = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword: hashedNewPassword }
  })

  return c.json({ message: 'Password updated successfully' })
})

export { profile }