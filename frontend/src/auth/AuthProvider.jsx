import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
  auth,
} from '../firebase/auth'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Subscribe to Firebase auth state; this keeps session across reloads
    const unsub = subscribeToAuthState((u) => {
      setUser(u)
      if (u) {
        // get initial ID token and keep it in state
        u.getIdToken()
          .then((t) => setToken(t))
          .catch(() => setToken(null))
      } else {
        setToken(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value = {
    user,
    loading,
    token,
    signInWithEmail: async (email, password) => {
      return signInWithEmail(email, password)
    },
    signUpWithEmail: async (email, password) => {
      return signUpWithEmail(email, password)
    },
    signInWithGoogle: async () => {
      return signInWithGoogle()
    },
    signOut: async () => {
      return signOutUser()
    },
    // get the current ID token (force refresh optional)
    getIdToken: async (forceRefresh = false) => {
      if (!auth.currentUser) return null
      const t = await auth.currentUser.getIdToken(forceRefresh)
      setToken(t)
      return t
    },
    auth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
