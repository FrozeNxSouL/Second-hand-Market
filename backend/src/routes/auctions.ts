import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import prisma from '../lib/prisma'
import type { CartProductType } from '../lib/prisma'

const auctions = new Hono()

// Get all auctions (public)
auctions.get('/', async (c) => {
  const auctions = await prisma.auction.findMany({
    include: {
      product: true,
      user: { select: { name: true } },
      auction_log: true
    }
  })
  return c.json(auctions)
})

// Get auction by product ID
auctions.get('/product/:productId', async (c) => {
  const productId = c.req.param('productId')
  const auction = await prisma.auction.findFirst({
    where: { productId },
    include: {
      product: true,
      user: true,
      auction_log: true
    }
  })
  if (!auction) return c.json({ error: 'Auction not found' }, 404)
  return c.json(auction)
})

// Place a bid
auctions.post('/bid', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')
  const { productId, bid } = await c.req.json()

  // Check wallet balance
  const wallet = await prisma.wallet.findFirst({
    where: { userId: user.id }
  })

  if (!wallet) {
    return c.json({ error: 'Wallet not found' }, 400)
  }

  if (wallet.cash - bid < 0) {
    return c.json({ error: 'Insufficient funds' }, 400)
  }

  const auctionLog = await prisma.auction_log.findFirst({
    where: {
      auction: { productId }
    }
  })

  if (!auctionLog) {
    return c.json({ error: 'Auction log not found' }, 404)
  }

  // Update auction log with history
  const arrID = [...auctionLog.bidder_id, auctionLog.auction?.bidderId].filter(Boolean) as string[]
  const arrBid = [...auctionLog.bidding_amount, auctionLog.auction?.currentBid].filter(Boolean) as number[]

  await prisma.auction_log.update({
    where: { id: auctionLog.id },
    data: {
      bidder_id: arrID,
      bidding_amount: arrBid
    }
  })

  // Update auction with new bid
  const updatedAuction = await prisma.auction.update({
    where: { productId },
    data: {
      currentBid: bid,
      bidderId: user.id,
      updatedAt: new Date()
    }
  })

  return c.json({ success: true, auction: updatedAuction })
})

// Settle auction after expiry
auctions.post('/settle/:productId', jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' }), async (c) => {
  const user = c.get('jwtPayload')
  const productId = c.req.param('productId')

  // Only managers can settle (or could be automated via cron)
  if (user.role !== 'manager') {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const auctionLog = await prisma.auction_log.findFirst({
    include: {
      auction: {
        include: {
          product: true
        }
      }
    },
    where: {
      auction: { productId }
    }
  })

  if (!auctionLog) {
    return c.json({ error: 'Auction log not found' }, 404)
  }

  const product = auctionLog.auction.product
  const currentBid = auctionLog.auction.currentBid
  const startingPrice = product.price

  if (currentBid === startingPrice) {
    // No winner - expired
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'expired' }
    })
    return c.json({ status: 'expired', message: 'No winner' })
  }

  // Winner exists - finished
  await prisma.product.update({
    where: { id: productId },
    data: { status: 'finished' }
  })

  const orderData = {
    user: { connect: { id: auctionLog.auction.bidderId } },
    totalPrice: currentBid,
    currency: 'thb',
    status: 'complete',
    deliveryStatus: 'pending',
    products: [{
      id: product.id,
      name: product.name,
      description: product.description,
      quantity: 1,
      price: product.price,
      img: product.imageUrl,
      tag: product.tag
    }] as CartProductType[]
  }

  const transaction = await prisma.transaction.create({ data: orderData })

  // Deduct from winner's wallet
  const wallet = await prisma.wallet.findFirst({
    where: { userId: auctionLog.auction.bidderId }
  })

  if (wallet) {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { cash: wallet.cash - currentBid }
    })
  }

  return c.json({ status: 'finished', transaction })
})

export default auctions