import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { createUserProfile } from '../api/userApi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user, signInWithEmail, signInWithGoogle, signOut, getIdToken } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      // get and log the ID token (bearer token)
      try {
        const id = await getIdToken()
        // eslint-disable-next-line no-console
        console.log('ID token after sign-in:', id)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('could not read ID token immediately after sign-in', e)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      const credential = await signInWithGoogle()
      const userObj = credential?.user || credential

      // If this is the first time this user signed in via Google, create a backend profile
      try {
        console.log('is new google user', credential?.additionalUserInfo?.isNewUser)
        let isNew = credential?.additionalUserInfo?.isNewUser
              if (isNew === undefined && userObj?.metadata) {
                isNew = userObj.metadata.creationTime === userObj.metadata.lastSignInTime
              }       
       if (isNew) {
          const id = await getIdToken()
          await createUserProfile(id, {
            display_name: credential.user.displayName || '',
            email: credential.user.email || '',
            phone_number: credential.user.phoneNumber || '',
          })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('failed to create backend profile for new google user', e)
      }
      // log ID token
      try {
        const id = await getIdToken()
        // eslint-disable-next-line no-console
        console.log('ID token after Google sign-in:', id)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('could not read ID token immediately after Google sign-in', e)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Bill Split — Login</h1>

        {user ? (
          <div className="logged-in">
            <p>Signed in as {user.email || user.displayName}</p>
            <button onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="row">
              <button type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <Link to="/register">
                <button type="button" className="muted">Create account</button>
              </Link>
            </div>

            <hr />

            <button type="button" onClick={handleGoogle} className="google">
              Continue with Google
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
