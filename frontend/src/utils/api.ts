// API endpoint constants — single source of truth for all backend routes
// Usage: import { PRODUCT, AUTH, AUCTION, CHECKOUT, ORDERS, ADMIN } from '@/utils/api'
// Then: apiGet(PRODUCT.GETALL)

const BASE = '/api'  // prefixed by api-client baseURL

export const AUTH = {
  LOGIN:     '/auth/login',
  REGISTER:  '/auth/register',
  ME:        '/auth/me',
} as const

export const PRODUCT = {
  GETALL:    '/products',
  SEARCH:    '/products/search',
  GET:       (id: string)               => `/products/${id}`,
  CREATE:    '/products',
  UPDATE:    (id: string)               => `/products/${id}`,
  DELETE:    (id: string)               => `/products/${id}`,
} as const

export const CATEGORY = {
  GETALL: '/category',
} as const

export const AUCTION = {
  GETALL:    '/auctions',
  BY_PRODUCT: (productId: string)       => `/auctions/product/${productId}`,
  BID:       '/auctions/bid',
  SETTLE:    (productId: string)        => `/auctions/settle/${productId}`,
} as const

export const CHECKOUT = {
  PAYMENT_INTENT: '/checkout/payment-intent',
} as const

export const ORDERS = {
  GETALL:    '/orders',
  GET:       (id: string)               => `/orders/${id}`,
  SOLD:      '/orders/sold',
  UPDATE_STATUS: (productId: string)    => `/orders/product/${productId}/status`,
} as const

export const ADMIN = {
  USERS:     '/admin/users',
  USER:      (id: string)               => `/admin/users/${id}`,
  REPORTS:   '/admin/reports',
  REPORT:    (id: string)               => `/admin/reports/${id}`,
  CATEGORIES: '/admin/categories',
  CATEGORY:   (id: string)             => `/admin/categories/${id}`,
  TAX:        '/admin/tax',
} as const

export const STRIPE_WEBHOOK = '/stripe-webhook'

export const PROFILE = {
  UPDATE_ADDRESS: '/profile/address',
  CHANGE_PASSWORD: '/profile/password',
  UPDATE:       '/profile',
} as const

export const WALLET = {
  GET:  '/wallet',
  ADD:  '/wallet',
} as const

export const REPORT = {
  CREATE: '/reports',
} as const