import React from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Link } from 'react-router-dom'

export default function Home() {
  const { user, signOut } = useAuth()

  return (
    <div className="container">
      <div className="card">
        <h1>Welcome</h1>
        <p>Signed in as {user?.email || user?.displayName}</p>
        <TokenDisplay />
        <div className="row">
          <Link to="/profile"><button type="button">Edit profile</button></Link>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>
    </div>
  )
}

function TokenDisplay() {
  const { token, getIdToken } = useAuth()

  const refresh = async () => {
    try {
      const t = await getIdToken(true)
      // eslint-disable-next-line no-console
      console.log('Refreshed ID token:', t)
      alert('Token refreshed and logged to console')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to refresh token', e)
      alert('Failed to refresh token; see console')
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <h3 style={{ marginBottom: 6 }}>ID Token</h3>
      <pre style={{ maxHeight: 160, overflow: 'auto', background: '#f6f8fa', padding: 8, borderRadius: 6 }}>
        {token || '— no token available —'}
      </pre>
      <div className="row" style={{ marginTop: 8 }}>
        <button onClick={refresh}>Refresh token</button>
      </div>
    </div>
  )
}
