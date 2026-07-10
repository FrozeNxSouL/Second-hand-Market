import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import authRoutes, { profile } from './routes/auth'
import productRoutes from './routes/products'
import auctionRoutes from './routes/auctions'
import checkoutRoutes from './routes/checkout'
import orderRoutes from './routes/orders'
import adminRoutes from './routes/admin'
import stripeWebhookRoutes from './routes/stripe-webhook'
import { wallet, report } from './routes/wallet'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('/api/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/profile', profile)
app.route('/api/products', productRoutes)
app.route('/api/auctions', auctionRoutes)
app.route('/api/checkout', checkoutRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/stripe-webhook', stripeWebhookRoutes)
app.route('/api/wallet', wallet)
app.route('/api/reports', report)

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Second Hand Market Backend' }))

const port = parseInt(process.env.PORT || '4000', 10)
console.log(`Server running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })