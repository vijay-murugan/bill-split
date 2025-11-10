import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getBills } from '../api/userApi'
import { Link } from 'react-router-dom'

export default function Bills() {
  const { user, getIdToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bills, setBills] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      setError(null)
        try {
        const token = await getIdToken()
        const res = await getBills(token)
        // log full response for debugging as requested
        // eslint-disable-next-line no-console
        console.log('getBills response', res)

        // normalize different possible response shapes from backend
        let list = []
        if (Array.isArray(res)) list = res
        else if (Array.isArray(res?.data)) list = res.data
        else if (Array.isArray(res?.bills)) list = res.bills
        else if (Array.isArray(res?.results)) list = res.results
        else if (res && typeof res === 'object') {
          // try to pick the first array-valued property
          const maybeArray = Object.values(res).find((v) => Array.isArray(v))
          if (Array.isArray(maybeArray)) list = maybeArray
        }

        // eslint-disable-next-line no-console
        console.log('normalized bills list', list)
        setBills(list)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('failed to load bills', e)
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (!user) return null

  return (
    <div className="container">
      <div className="card">
        <h1>Your bills</h1>
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : bills.length === 0 ? (
          <p>No bills found.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {bills.map((b, idx) => {
              const id = b.id ?? b._id ?? b.bill_id ?? b.billId ?? String(idx)
              const title = b.title || b.name || 'Untitled bill'
              const amount = Number(b.total ?? b.amount ?? b.value ?? 0) || 0
              const date = b.created_at || b.createdAt || b.date || ''

              return (
                <Link
                  to={`/bills/${id}`}
                  key={id}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="bill-card"
                    style={{
                      padding: 12,
                      border: '1px solid #e6e6e6',
                      borderRadius: 8,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      background: '#fff',
                      cursor: 'pointer',
                      minHeight: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
                      <div style={{ color: '#666', fontSize: 12 }}>ID: {id}</div>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>${amount.toFixed(2)}</strong>
                      {date ? <span style={{ color: '#999', fontSize: 12 }}>{date}</span> : null}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <Link to="/add-bill"><button type="button">Create bill</button></Link>
          <Link to="/"><button type="button" className="muted">Back</button></Link>
        </div>
      </div>
    </div>
  )
}
