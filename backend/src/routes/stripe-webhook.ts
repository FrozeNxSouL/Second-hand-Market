import { Hono } from 'hono'
import Stripe from 'stripe'
import prisma from '../lib/prisma'

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const stripeWebhook = new Hono()

stripeWebhook.post('/', async (c) => {
  const signature = c.req.header('stripe-signature')
  const rawBody = await c.req.raw.clone().text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return c.json({ error: `Webhook signature verification failed` }, 400)
  }

  if (event.type === 'charge.succeeded') {
    const charge = event.data.object as Stripe.Charge
    const paymentIntentId = charge.payment_intent as string

    // Update transaction status
    await prisma.transaction.updateMany({
      where: { paymentIntentId },
      data: {
        status: 'complete',
        deliveryStatus: 'pending'
      }
    })
  }

  return c.json({ received: true })
})

export default stripeWebhook