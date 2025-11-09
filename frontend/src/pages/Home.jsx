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
        <div className="row">
          <Link to="/profile"><button type="button">View profile</button></Link>
          <Link to="/friends"><button type="button">Friends</button></Link>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
 
