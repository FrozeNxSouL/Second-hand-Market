import prisma from '../lib/prisma'
import type { CartProductType } from '@prisma/client'

export async function checkWalletBalance(userId: string, amount: number): Promise<boolean> {
  const wallet = await prisma.wallet.findFirst({
    where: { userId }
  })
  
  if (!wallet) return false
  return wallet.cash >= amount
}

export async function deductWallet(userId: string, amount: number): Promise<void> {
  const wallet = await prisma.wallet.findFirst({
    where: { userId }
  })
  
  if (!wallet) throw new Error('Wallet not found')

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { cash: wallet.cash - amount }
  })
}

export async function addWalletFunds(userId: string, amount: number): Promise<void> {
  const wallet = await prisma.wallet.findFirst({
    where: { userId }
  })

  if (!wallet) throw new Error('Wallet not found')

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { cash: wallet.cash + amount }
  })
}

export async function getWallet(userId: string) {
  return prisma.wallet.findFirst({
    where: { userId }
  })
}

export function calculateOrderTotal(items: CartProductType[], taxPercent: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxAmount = subtotal * (taxPercent / 100)
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount
  }
}