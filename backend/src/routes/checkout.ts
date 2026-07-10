import { Hono } from 'hono'
import Stripe from 'stripe'
import prisma from '../lib/prisma'
import type { CartProductType } from '../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const checkout = new Hono()

// Create or update payment intent
checkout.post('/payment-intent', async (c) => {
  const { items, paymentIntentId } = await c.req.json()

  // Calculate total with tax
  const management = await prisma.management.findFirst()
  const tax = management?.tax || 0

  const total = items.reduce((sum: number, item: CartProductType) => {
    return sum + (item.price * item.quantity)
  }, 0)

  const taxAmount = total * (tax / 100)
  const totalPrice = total + taxAmount

  let paymentIntent

  if (paymentIntentId) {
    // Update existing
    paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(totalPrice * 100)
    })
  } else {
    // Create new
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'thb',
      automatic_payment_methods: { enabled: true }
    })
  }

  return c.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  })
})

export default checkout