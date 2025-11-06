import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUpWithEmail(email, password)
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
        <form onSubmit={handleRegister} className="form">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
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
      </div>
    </div>
  )
}
