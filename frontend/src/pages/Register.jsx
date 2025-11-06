import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { createUserProfile as createProfileApi } from '../api/userApi'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signUpWithEmail, getIdToken, user, signOut, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    console.log('Register: handleRegister called')
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const userCred = await signUpWithEmail(email, password)

      // update Firebase user displayName
      try {
        await updateProfile(auth.currentUser, { displayName: username })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('could not update firebase displayName', e)
      }
      // after signup, call backend to create profile (bearer token required)
      try {
        const token = await getIdToken()
        await createProfileApi(token, {
          display_name: username,
          email,
          phone_number: phone,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('backend create user failed', err)
      }

      // navigate to root; AuthProvider will pick up logged in user and token
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
        <h1>Create account</h1>

        {user ? (
          <div className="logged-in">
            <p>Signed in as {user.email || user.displayName}</p>
            <div className="row">
              <button onClick={() => signOut()}>Sign out</button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleRegister} className="form">
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1555..." />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <div className="row">
            <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
          </div>
          {error && <p className="error">{error}</p>}
          </form>
          <p style={{ marginTop: 8 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          </>
        )}

        <hr />
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            className="google"
            disabled={!!user || loading}
            onClick={async () => {
              if (user) return
              setError(null)
              setLoading(true)
              try {
                const credential = await signInWithGoogle()
                const userObj = credential?.user || credential
                const id = await getIdToken()
                try {
                  await createProfileApi(id, {
                    display_name: userObj.displayName || '',
                    email: userObj.email || '',
                    phone_number: userObj.phoneNumber || '',
                  })
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('failed to create/update backend profile for google user', e)
                }
                navigate('/', { replace: true })
              } catch (e) {
                setError(e.message || String(e))
              } finally {
                setLoading(false)
              }
            }}
          >
            {user ? 'Signed in' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
