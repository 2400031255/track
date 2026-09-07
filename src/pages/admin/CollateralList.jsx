import { useEffect, useState } from 'react'
import { getAllCollateral, updateCollateralStatus } from '../../services/collateralService'
import { formatDate } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function CollateralList({ status }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [returnModal, setReturnModal] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const titleMap = { held: 'Currently Held', ready: 'Ready for Return', returned: 'Returned Items' }

  const load = () => {
    setLoading(true)
    getAllCollateral({ status }).then(data => { setItems(data); setLoading(false) })
  }

  useEffect(() => { load() }, [status])

  const handleStatusUpdate = async (id, newStatus) => {
    setSaving(true)
    try {
      await updateCollateralStatus(id, newStatus, notes, user.uid)
      toast.success(`Status updated to ${newStatus}`)
      setReturnModal(null)
      setNotes('')
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{titleMap[status]}</h1>
          <p className="page-subtitle">{items.length} items</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>No items</h3>
              <p>No collateral with {status} status</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Item</th><th>Category</th><th>Borrower</th><th>Est. Value</th><th>Date</th><th>Photos</th>{status !== 'returned' && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {items.map(c => (
                  <tr key={c.id}>
                    <td className="text-gold text-sm font-semibold">{c.collateralId}</td>
                    <td>
                      <div className="font-semibold">{c.itemName}</div>
                      {c.brand && <div className="text-gray text-xs">{c.brand} {c.model}</div>}
                    </td>
                    <td>{c.category}</td>
                    <td>{c.borrowerName || '—'}</td>
                    <td>{formatCurrency(c.estimatedValuePaise)}</td>
                    <td className="text-gray text-sm">{formatDate(c.createdAt)}</td>
                    <td>
                      {c.photos?.length > 0 ? (
                        <div className="flex gap-1">
                          {c.photos.slice(0, 3).map((p, i) => (
                            <a key={i} href={p.url} target="_blank" rel="noreferrer">
                              <img src={p.url} alt={p.label} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                            </a>
                          ))}
                          {c.photos.length > 3 && <span className="text-gray text-xs" style={{ alignSelf: 'center' }}>+{c.photos.length - 3}</span>}
                        </div>
                      ) : <span className="text-gray text-xs">None</span>}
                    </td>
                    {status !== 'returned' && (
                      <td>
                        <div className="flex gap-2">
                          {status === 'held' && (
                            <button className="btn btn-outline btn-sm" onClick={() => handleStatusUpdate(c.id, 'ready')}>Mark Ready</button>
                          )}
                          {status === 'ready' && (
                            <button className="btn btn-success btn-sm" onClick={() => setReturnModal(c.id)}>Return</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {returnModal && (
        <div className="modal-overlay" onClick={() => setReturnModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold" style={{ fontSize: 16 }}>Confirm Return</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setReturnModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Return Notes</label>
                <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about the return..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setReturnModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={() => handleStatusUpdate(returnModal, 'returned')} disabled={saving}>
                {saving ? 'Processing...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
