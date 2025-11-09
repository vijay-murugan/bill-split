import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getUserProfile, updateUserProfile } from '../api/userApi'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase/auth'

export default function ProfilePage() {
  const { user, getIdToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!user) return
    console.log('ProfilePage: fetching profile for user', user.uid, user)
    setDisplayName(user.displayName || '')
    setEmail(user.email || '')
    ;(async () => {
      setLoading(true)
      try {
        const token = await getIdToken()
        const profile = await getUserProfile(token, user.uid)
        if (profile) {
          setDisplayName(profile.display_name || (user.displayName || ''))
          setPhone(profile.phone_number || '')
          setEmail(profile.email || user.email || '')
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('could not fetch backend profile', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const token = await getIdToken()
      await updateUserProfile(token, user.uid, {
        display_name: displayName,
        phone_number: phone,
        // include email so backend receives canonical email even though it's not editable here
        email,
      })
      try {
        await updateProfile(auth.currentUser, { displayName })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('could not update firebase profile', e)
      }
      setSuccess('Profile updated')
    } catch (e) {
      setError(e.message || String(e))
    }
  }

  if (!user) return null

  return (
    <div className="container">
      <div className="card">
        <h1>Profile</h1>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <form className="form" onSubmit={handleSave}>
            <label>
              Name
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </label>
            <label>
              Email
              <input value={email} disabled />
            </label>
            <label>
              Phone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1555..." />
            </label>
            <div className="row">
              <button type="submit">Save</button>
            </div>
            {error && <p className="error">{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
