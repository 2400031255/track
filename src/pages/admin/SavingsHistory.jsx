import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { getSavings, addSavings } from '../../services/savingsService'
import { useAuth } from '../../context/AuthContext'
import { formatDate, isToday, isThisWeek, isThisMonth, isThisYear } from '../../utils/dates'
import { formatCurrency, toRupees } from '../../utils/currency'
import toast from 'react-hot-toast'

export default function SavingsHistory() {
  const { user } = useAuth()
  const [savings, setSavings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], source: 'Business Profit', notes: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getSavings().then(data => { setSavings(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const totalPaise = savings.reduce((s, e) => s + (e.amountPaise || 0), 0)
  const todayPaise = savings.filter(e => isToday(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)
  const weekPaise = savings.filter(e => isThisWeek(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)
  const monthPaise = savings.filter(e => isThisMonth(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)
  const yearPaise = savings.filter(e => isThisYear(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addSavings(form, user.uid)
      toast.success('Savings added')
      setShowModal(false)
      setForm({ amount: '', date: new Date().toISOString().split('T')[0], source: 'Business Profit', notes: '' })
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings</h1>
          <p className="page-subtitle">Track your personal and business savings</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}><Plus size={16} /> Add Savings</button>
      </div>

      <div className="stats-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Savings', value: formatCurrency(totalPaise) },
          { label: 'This Year', value: formatCurrency(yearPaise) },
          { label: 'This Month', value: formatCurrency(monthPaise) },
          { label: 'This Week', value: formatCurrency(weekPaise) },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value text-gold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Savings History</h3></div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : savings.length === 0 ? (
            <div className="empty-state"><h3>No savings yet</h3><p>Add your first savings entry</p></div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Amount</th><th>Source</th><th>Notes</th></tr></thead>
              <tbody>
                {savings.map(s => (
                  <tr key={s.id}>
                    <td className="text-sm">{formatDate(s.date)}</td>
                    <td className="font-bold text-gold">{formatCurrency(s.amountPaise)}</td>
                    <td>{s.source}</td>
                    <td className="text-gray text-sm">{s.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold" style={{ fontSize: 16 }}>Add Savings</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input type="number" className="form-input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required min="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input type="date" className="form-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <select className="form-select" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                    {['Business Profit', 'Interest Income', 'Personal', 'Other'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Saving...' : 'Add Savings'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
