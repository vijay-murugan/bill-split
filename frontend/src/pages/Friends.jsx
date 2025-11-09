import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getFriends, addFriend } from '../api/userApi'
import { Link } from 'react-router-dom'

export default function Friends() {
  const { user, getIdToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [friends, setFriends] = useState([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const load = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const token = await getIdToken()
      const list = await getFriends(token)
      // Expect list to be an array of strings (e.g. ['a@x.com','b@y.com'])
      // eslint-disable-next-line no-console
      console.debug('getFriends response', list)
      setFriends(Array.isArray(list) ? list : [])
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('failed to load friends', e)
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email) return setError('Please enter an email')
    try {
      const token = await getIdToken()
      await addFriend(token, { email })
      setSuccess('Friend request sent / friend added')
      setEmail('')
      await load()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('add friend failed', e)
      setError(e.message || String(e))
    }
  }

  if (!user) return null

  return (
    <div className="container">
      <div className="card">
        <h1>Friends</h1>
        <p>Manage your friends. Use the email field below to add someone.</p>

        <form className="form" onSubmit={handleAdd} style={{ marginBottom: 12 }}>
          <label>
            Friend's email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="friend@example.com" />
          </label>
          <div className="row">
            <button type="submit">Add friend</button>
            <Link to="/"><button type="button" className="muted">Back</button></Link>
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </form>

        <h2>Your friends</h2>
        {loading ? (
          <p>Loading…</p>
        ) : friends && friends.length > 0 ? (
          <ul>
            {friends.map((f, i) => (
              // friends are expected to be simple strings (emails)
              <li key={f ?? `friend-${i}`}>
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p>No friends yet.</p>
        )}
      </div>
    </div>
  )
}
