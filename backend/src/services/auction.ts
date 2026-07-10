import prisma from '../lib/prisma'
import type { CartProductType } from '@prisma/client'

export async function settleAuction(productId: string) {
  const auctionLog = await prisma.auction_log.findFirst({
    include: {
      auction: {
        include: { product: true }
      }
    },
    where: { auction: { productId } }
  })

  if (!auctionLog) {
    throw new Error('Auction log not found')
  }

  const product = auctionLog.auction.product
  const currentBid = auctionLog.auction.currentBid
  const startingPrice = product.price

  if (currentBid === startingPrice) {
    // No winner — mark as expired
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'expired' }
    })
    return { status: 'expired', winner: null }
  }

  // Winner exists — mark as finished
  await prisma.product.update({
    where: { id: productId },
    data: { status: 'finished' }
  })

  // Create transaction for winner
  const order = await prisma.transaction.create({
    data: {
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
  })

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

  return { status: 'finished', winner: auctionLog.auction.bidderId, transaction: order }
}

export async function placeAuctionBid(productId: string, bid: number, userId: string) {
  // Check wallet
  const wallet = await prisma.wallet.findFirst({
    where: { userId }
  })

  if (!wallet || wallet.cash < bid) {
    throw new Error('Insufficient funds')
  }

  const auctionLog = await prisma.auction_log.findFirst({
    where: { auction: { productId } }
  })

  if (!auctionLog) {
    throw new Error('Auction log not found')
  }

  // Push previous bidder and amount to history
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
      bidderId: userId,
      updatedAt: new Date()
    }
  })

  return updatedAuction
}

export async function getAuctionByProductId(productId: string) {
  return prisma.auction.findFirst({
    where: { productId },
    include: {
      product: true,
      user: { select: { name: true, picture: true } },
      auction_log: true
    }
  })
}