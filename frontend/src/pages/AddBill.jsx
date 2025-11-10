import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getFriends, createBill } from '../api/userApi'
import { useNavigate } from 'react-router-dom'

function makeId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`
}

export default function AddBill() {
  const { user, getIdToken } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [friends, setFriends] = useState([]) // array of strings (emails)
  const [participants, setParticipants] = useState([]) // users included in this bill (emails)
  const [taxPercent, setTaxPercent] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const token = await getIdToken()
        const list = await getFriends(token)
        const normalized = Array.isArray(list) ? list : []
        setFriends(normalized)
        // initialize participants to include current user by default
        setParticipants((p) => (p && p.length ? p : [user.email]))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('could not load friends', e)
      }
    })()
  }, [user])

  // participants are those added to the bill (by default the current user)
  const allParticipants = useMemo(() => {
    return Array.from(new Set([...(participants || [])]))
  }, [participants])

  const addItem = () => {
    setItems((s) => [
      ...s,
      { id: makeId(), name: '', quantity: 1, price: 0, totalPrice: 0, billUserIds: participants.length ? [...participants] : [user.email] },
    ])
  }

  const updateItem = (id, patch) => {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch, totalPrice: ((patch.quantity ?? it.quantity) * (patch.price ?? it.price)) } : it)))
  }

  const removeItem = (id) => setItems((s) => s.filter((it) => it.id !== id))

  const addParticipant = (email) => {
    if (!email) return
    setParticipants((p) => Array.from(new Set([...(p || []), email])))
  }

  const removeParticipant = (email) => {
    setParticipants((p) => (p || []).filter((x) => x !== email))
    // also remove from any item assignments
    setItems((its) => its.map((it) => ({ ...it, billUserIds: (it.billUserIds || []).filter((u) => u !== email) })))
  }

  const subtotal = useMemo(() => items.reduce((acc, it) => acc + Number(it.totalPrice || 0), 0), [items])
  const taxAmount = (subtotal * Number(taxPercent || 0)) / 100
  const discountAmount = (subtotal * Number(discountPercent || 0)) / 100
  const total = subtotal + taxAmount - discountAmount

  const splits = useMemo(() => {
    const perUserPre = {}
    items.forEach((it) => {
      const totalItem = Number(it.totalPrice || 0)
      const assigned = Array.isArray(it.billUserIds) && it.billUserIds.length > 0 ? it.billUserIds : [user.email]
      const share = totalItem / assigned.length
      assigned.forEach((u) => {
        perUserPre[u] = (perUserPre[u] || 0) + share
      })
    })
    // apply tax/discount proportionally
    const result = {}
    Object.keys(perUserPre).forEach((u) => {
      const pre = perUserPre[u]
      const userTax = subtotal > 0 ? (pre / subtotal) * taxAmount : 0
      const userDiscount = subtotal > 0 ? (pre / subtotal) * discountAmount : 0
      result[u] = +(pre + userTax - userDiscount).toFixed(2)
    })
    return result
  }, [items, subtotal, taxAmount, discountAmount, user.email])

  const buildPayload = () => {
    const billUsers = (participants || []).map((p) => {
      const assigned_item_ids = items.filter((it) => (it.billUserIds || []).includes(p)).map((it) => it.id)
      return {
        id: p,
        email: p,
        display_name: p.split('@')[0],
        phone_number: null,
        assigned_item_ids,
        amount_due: splits[p] || 0,
      }
    })

    return {
      title,
      email: user?.email || null,
      items: items.map((it) => ({ id: it.id, name: it.name, quantity: Number(it.quantity), price: Number(it.price), totalPrice: Number(it.totalPrice), billUserIds: it.billUserIds })),
      tax_percent: Number(taxPercent),
      discount_percent: Number(discountPercent),
      subtotal,
      tax_amount: Number(taxAmount),
      discount_amount: Number(discountAmount),
      total,
      splits,
      bill_users: billUsers,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const token = await getIdToken()
      const payload = buildPayload()
      // eslint-disable-next-line no-console
      console.debug('createBill payload', JSON.stringify(payload, null, 2))
      await createBill(token, payload)
      navigate('/', { replace: true })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('create bill failed', err)
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="container">
      <div className="card">
        <h1>Create new bill</h1>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dinner at Joe's" />
          </label>

          <h3>Participants</h3>
          <p>Select friends to include in this bill (they can be assigned to items below).</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ minWidth: 220 }}>
              <strong>Included</strong>
              <ul>
                {participants.map((p) => (
                  <li key={p}>
                    {p} <button type="button" onClick={() => removeParticipant(p)} className="muted">Remove</button>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ minWidth: 220 }}>
              <strong>Friends</strong>
              <ul>
                {friends.map((f) => (
                  <li key={f}>
                    {f} {participants.includes(f) ? <em>Added</em> : <button type="button" onClick={() => addParticipant(f)}>Add</button>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h3>Items</h3>
          {items.map((it) => (
            <div key={it.id} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <label>
                Name
                <input value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })} />
              </label>
              <label>
                Quantity
                <input type="number" min="0" value={it.quantity} onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) || 0 })} />
              </label>
              <label>
                Price
                <input type="number" min="0" step="0.01" value={it.price} onChange={(e) => updateItem(it.id, { price: Number(e.target.value) || 0 })} />
              </label>
              <label>
                Assigned to (select multiple)
                <select multiple value={it.billUserIds} onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions).map((o) => o.value)
                  updateItem(it.id, { billUserIds: opts })
                }}>
                  {allParticipants.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <div>Item total: {(Number(it.totalPrice) || (Number(it.quantity) * Number(it.price))).toFixed(2)}</div>
              <div className="row">
                <button type="button" onClick={() => removeItem(it.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="row">
            <button type="button" onClick={addItem}>Add item</button>
          </div>

          <label>
            Tax %
            <input type="number" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value) || 0)} />
          </label>
          <label>
            Discount %
            <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)} />
          </label>

          <h3>Summary</h3>
          <div>Subtotal: {subtotal.toFixed(2)}</div>
          <div>Tax: {taxAmount.toFixed(2)}</div>
          <div>Discount: {discountAmount.toFixed(2)}</div>
          <div><strong>Total: {total.toFixed(2)}</strong></div>

          <h3>Per person</h3>
          <ul>
            {Object.keys(splits).length === 0 ? <li>No assignments yet</li> : Object.entries(splits).map(([u, amount]) => (
              <li key={u}>{u}: {amount.toFixed(2)}</li>
            ))}
          </ul>

          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="button" onClick={() => {
              // Log constructed JSON payload to console for inspection
              // eslint-disable-next-line no-console
              console.log(buildPayload())
            }}>Log JSON</button>
            <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create bill'}</button>
            <button type="button" className="muted" onClick={() => navigate('/')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
