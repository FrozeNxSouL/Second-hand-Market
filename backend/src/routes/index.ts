import { Hono } from 'hono'
import { authRoutes } from './auth'
import { productRoutes } from './products'
import { auctionRoutes } from './auctions'
import { adminRoutes } from './admin'
import { checkoutRoutes } from './checkout'
import { stripeWebhookRoutes } from './stripe-webhook'

export const apiRoutes = new Hono()

apiRoutes.route('/auth', authRoutes)
apiRoutes.route('/products', productRoutes)
apiRoutes.route('/auctions', auctionRoutes)
apiRoutes.route('/admin', adminRoutes)
apiRoutes.route('/checkout', checkoutRoutes)
apiRoutes.route('/stripe-webhook', stripeWebhookRoutes)