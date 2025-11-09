// ProfileEdit has been removed — route kept for compatibility may redirect elsewhere.
import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProfileEdit() {
  // Redirect to /profile — the edit page was removed per request.
  return <Navigate to="/profile" replace />
}
