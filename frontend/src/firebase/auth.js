import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { firebaseConfig } from './config'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Small debug helper: print presence of key config fields (don't print raw apiKey)
try {
  // show whether critical config fields are present
  // eslint-disable-next-line no-console
  console.debug('firebase config loaded:', {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  })
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('could not read firebaseConfig for debug', e)
}

export async function signInWithEmail(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password)
  return res.user
}

export async function signUpWithEmail(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password)
  return res.user
}

export async function signInWithGoogle() {
  try {
    const res = await signInWithPopup(auth, googleProvider)
    return res.user
  } catch (err) {
    // Provide richer debug info in console so we can see the Firebase error code and customData
    // eslint-disable-next-line no-console
    console.error('signInWithGoogle failed', {
      code: err.code,
      message: err.message,
      customData: err.customData || null,
      stack: err.stack,
    })
    throw err
  }
}

export async function signOutUser() {
  await signOut(auth)
}

export { auth }

// Subscribe to auth state changes. Returns the unsubscribe function.
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}
