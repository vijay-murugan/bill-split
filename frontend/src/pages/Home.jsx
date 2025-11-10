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
          <Link to="/add-bill"><button type="button">Create bill</button></Link>
          <Link to="/bills"><button type="button">View bills</button></Link>
          <button onClick={signOut}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
 
