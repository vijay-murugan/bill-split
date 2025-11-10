const BASE = import.meta.env.VITE_BACKEND_URL || ''

// Import current firebase auth so we can enrich payloads with current user data
import { auth } from '../firebase/auth'

async function request(path, token, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  console.log('API response', { path, method, status: res.status }, res)
  if (!res.ok) {
    const text = await res.text()
    const err = new Error(`API ${method} ${path} failed: ${res.status} ${text}`)
    // attach status for callers
    // eslint-disable-next-line no-undef
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

export async function createUserProfile(token, payload) {
  // POST /users
  // Merge known fields from current firebase user if available so backend gets uid/email etc.
  const current = auth?.currentUser || null
  console.log(payload)
  const enriched = {
    uid: payload?.uid || current?.uid,
    email: payload?.email || current?.email,
    display_name: payload?.display_name ?? current?.displayName ?? undefined,
    phone_number: payload?.phone_number ?? current?.phoneNumber ?? undefined,
  provider: payload?.provider ?? current?.providerData?.[0]?.providerId ?? undefined,
    // keep any extra fields the caller supplied
    ...payload,
  }

  // log payload for debug (do not log sensitive fields in production)
  // eslint-disable-next-line no-console
  console.debug('createUserProfile: calling backend', { path: 'api/users/create', payload: enriched })
  const res = await request('api/users/create', token, 'POST', enriched)
  // eslint-disable-next-line no-console
  console.debug('createUserProfile: backend response', res)
  return res
}

export async function updateUserProfile(token, uid, payload) {
  // PUT /users/:uid
  // Enrich payload with current auth user details when available so backend receives required fields
  const current = auth?.currentUser || null
  const enriched = {
    uid: uid || payload?.uid || current?.uid,
    email: payload?.email || current?.email,
    display_name: payload?.display_name ?? current?.displayName ?? undefined,
    phone_number: payload?.phone_number ?? current?.phoneNumber ?? undefined,
    photo_url: payload?.photo_url ?? current?.photoURL ?? undefined,
  provider: payload?.provider ?? current?.providerData?.[0]?.providerId ?? undefined,
    ...payload,
  }

  // eslint-disable-next-line no-console
  console.debug('updateUserProfile: calling backend', { path: `api/users/${uid}`, payload: enriched })
  return request(`api/users/${uid}`, token, 'PUT', enriched)
}

export async function getUserProfile(token, uid) {
  return request(`api/users/${uid}`, token, 'GET')
}

export async function getFriends(token) {
  // GET list of friends for the authenticated user
  return request('api/friends/get', token, 'GET')
}

export async function addFriend(token, payload) {
  // POST a new friend (payload should contain { email })
  return request('api/friends/add', token, 'POST', payload)
}

export async function createBill(token, payload) {
  return request('api/billing/add', token, 'POST', payload)
}

export async function getBills(token) {
  // GET list of bills (backend endpoint returns array of { id, amount, ... })
  return request('api/billing/get', token, 'GET')
}
