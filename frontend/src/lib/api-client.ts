// ---- Server / client base URL ----
const isServer = typeof window === 'undefined'
const BASE_URL = isServer
  ? (process.env.API_URL || 'http://localhost:4000/api')
  : (process.env.NEXT_PUBLIC_API_URL || '/api')

// ---- Auth token (mirrors old axios defaults) ----
let _authToken: string | null = null

/** Call this after login / token restore so every outgoing request gets the header. */
export function setAuthToken(token: string | null) {
  _authToken = token
}

export function clearAuthToken() {
  _authToken = null
}

// ---- Internal helpers ----

function buildUrl(path: string, params?: Record<string, any>): string {
  const url = `${BASE_URL}${path}`
  if (!params) return url
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return qs ? `${url}?${qs}` : url
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (typeof window !== 'undefined') {
    const token = _authToken ?? localStorage.getItem('token')
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse(res: Response) {
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token')
    _authToken = null
    window.location.href = '/auth/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const body = await res.text()
    let msg = body
    try { msg = JSON.parse(body).error || body } catch {}
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return res.json()
}

// ---- Public API (replaces axios calls) ----

/** GET with optional URL query params. */
export function apiGet<T = any>(path: string, params?: Record<string, any>): Promise<T> {
  return fetch(buildUrl(path, params), { headers: authHeaders() }).then(handleResponse)
}

/** POST with JSON body. */
export function apiPost<T = any>(path: string, body?: any): Promise<T> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse)
}

/** PUT with JSON body. */
export function apiPut<T = any>(path: string, body?: any): Promise<T> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse)
}

/** DELETE. */
export function apiDelete<T = any>(path: string): Promise<T> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(handleResponse)
}

// ---- Type exports (unchanged) ----

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string[]
  tag: string[]
  status: string
  score: number
  userId: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string
  picture: string
  score: number
}

export interface Auction {
  id: string
  productId: string
  currentBid: number
  bidderId: string
  product: Product
}

export interface Transaction {
  id: string
  totalPrice: number
  currency: string
  status: string
  deliveryStatus: string
  paymentIntentId: string
  products: CartProductType[]
}

export interface CartProductType {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  img: string[]
  tag: string[]
}
