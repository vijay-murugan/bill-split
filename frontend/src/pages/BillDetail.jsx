import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getBill } from '../api/userApi'

export default function BillDetail() {
  const { id } = useParams()
  const { user, getIdToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bill, setBill] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const token = await getIdToken()
        const res = await getBill(token, id)
        // eslint-disable-next-line no-console
        console.log('getBill response', res)
        setBill(res)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('failed to load bill', e)
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [user, id])

  if (!user) return null

  if (loading) return (
    <div className="container"><div className="card"><p>Loading…</p></div></div>
  )

  if (error) return (
    <div className="container"><div className="card"><p className="error">{error}</p><Link to="/bills"><button type="button">Back to bills</button></Link></div></div>
  )

  if (!bill) return (
    <div className="container"><div className="card"><p>No bill data</p><Link to="/bills"><button type="button">Back</button></Link></div></div>
  )

  const {
    title,
    items = [],
    tax_percent,
    discount_percent,
    subtotal,
    tax_amount,
    discount_amount,
    total,
    splits = {},
    bill_users = [],
    created_at,
  } = bill

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0 }}>{title || 'Bill'}</h1>
            {created_at ? <div style={{ color: '#666', fontSize: 12, marginTop: 6 }}>{new Date(created_at).toLocaleString()}</div> : null}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#666' }}>Total</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>${Number(total ?? 0).toFixed(2)}</div>
          </div>
        </div>

        <hr style={{ margin: '12px 0' }} />

        <h3 style={{ marginTop: 0 }}>Items</h3>
        {items.length === 0 ? <p style={{ color: '#666' }}>No items</p> : (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f3f3' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div style={{ fontSize: 12, color: '#777' }}>Qty: {it.quantity} • Price: ${Number(it.price).toFixed(2)}</div>
                  {it.billUserIds?.length ? <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>Shared by: {it.billUserIds.join(', ')}</div> : null}
                </div>
                <div style={{ fontWeight: 700 }}>${Number(it.totalPrice ?? (it.price * (it.quantity ?? 1))).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <div style={{ width: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><div style={{ color: '#666' }}>Subtotal</div><div>${Number(subtotal ?? 0).toFixed(2)}</div></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><div style={{ color: '#666' }}>Tax ({tax_percent ?? 0}%)</div><div>${Number(tax_amount ?? 0).toFixed(2)}</div></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><div style={{ color: '#666' }}>Discount ({discount_percent ?? 0}%)</div><div>-${Number(discount_amount ?? 0).toFixed(2)}</div></div>
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: 700 }}><div>Total</div><div>${Number(total ?? 0).toFixed(2)}</div></div>
          </div>
        </div>

        <hr style={{ margin: '12px 0' }} />

        <h3 style={{ marginTop: 0 }}>Splits</h3>
        {Object.keys(splits || {}).length === 0 ? <p style={{ color: '#666' }}>No splits</p> : (
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(splits).map(([userId, amt]) => (
              <div key={userId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', border: '1px solid #f1f1f1', borderRadius: 6 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{userId}</div>
                </div>
                <div style={{ fontWeight: 700 }}>${Number(amt ?? 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        <hr style={{ margin: '12px 0' }} />

        <h3 style={{ marginTop: 0 }}>Participants</h3>
        {(!bill_users || bill_users.length === 0) ? <p style={{ color: '#666' }}>No participants</p> : (
          <div style={{ display: 'grid', gap: 8 }}>
            {bill_users.map((u) => (
              <div key={u.id} style={{ padding: 8, border: '1px solid #f1f1f1', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{u.display_name || u.email}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>${Number(u.amount_due ?? 0).toFixed(2)}</div>
                    {u.phone_number ? <div style={{ fontSize: 12, color: '#666' }}>{u.phone_number}</div> : null}
                  </div>
                </div>
                {u.assigned_item_ids?.length ? <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Items: {u.assigned_item_ids.join(', ')}</div> : null}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Link to="/bills"><button type="button">Back to bills</button></Link>
          <Link to="/"><button type="button" className="muted">Home</button></Link>
        </div>
      </div>
    </div>
  )
}
