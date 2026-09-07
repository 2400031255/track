import { useEffect, useState } from 'react'
import { getSavings, getSavingsTargets, setSavingsTarget } from '../../services/savingsService'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, toRupees } from '../../utils/currency'
import { daysRemainingInMonth } from '../../utils/dates'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function SavingsTargets() {
  const { user } = useAuth()
  const [savings, setSavings] = useState([])
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), target: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getSavings(), getSavingsTargets()]).then(([s, t]) => { setSavings(s); setTargets(t); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const getMonthSaved = (month, year) =>
    savings.filter(s => {
      const d = s.date?.toDate ? s.date.toDate() : new Date(s.date)
      return d.getMonth() + 1 === month && d.getFullYear() === year
    }).reduce((sum, s) => sum + (s.amountPaise || 0), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await setSavingsTarget(form, user.uid)
      toast.success('Target saved')
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const currentTarget = targets.find(t => t.month === currentMonth && t.year === currentYear)
  const currentSaved = getMonthSaved(currentMonth, currentYear)
  const targetPaise = currentTarget?.targetPaise || 0
  const progress = targetPaise > 0 ? Math.min(100, Math.round((currentSaved / targetPaise) * 100)) : 0
  const remaining = Math.max(0, targetPaise - currentSaved)
  const daysLeft = daysRemainingInMonth()
  const dailyRequired = daysLeft > 0 && remaining > 0 ? Math.round(toRupees(remaining) / daysLeft) : 0

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Targets</h1>
          <p className="page-subtitle">Set and track monthly savings goals</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Set Monthly Target</h3></div>
          <form onSubmit={handleSubmit}>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select className="form-select" value={form.month} onChange={e => setForm(p => ({ ...p, month: Number(e.target.value) }))}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{format(new Date(2024, i, 1), 'MMMM')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))}>
                    {[currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount (₹) *</label>
                <input type="number" className="form-input" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} required min="1" />
              </div>
              <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Saving...' : 'Set Target'}</button>
            </div>
          </form>
        </div>

        {targetPaise > 0 && (
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>{format(now, 'MMMM yyyy')} Progress</h3></div>
            <div className="card-body">
              <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
                <span className="text-gray text-sm">Saved</span>
                <span className="font-bold text-gold">{formatCurrency(currentSaved)}</span>
              </div>
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <span className="text-gray text-sm">Target</span>
                <span className="font-semibold">{formatCurrency(targetPaise)}</span>
              </div>
              <div className="progress-bar" style={{ height: 12, marginBottom: 12 }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="font-bold" style={{ fontSize: 22, color: 'var(--charcoal)', marginBottom: 4 }}>{progress}% completed</p>
              {remaining > 0 ? (
                <>
                  <p className="text-gray text-sm">{formatCurrency(remaining)} remaining</p>
                  <p className="text-gray text-sm">{daysLeft} days left · ₹{dailyRequired.toLocaleString('en-IN')}/day required</p>
                </>
              ) : (
                <p className="text-success font-semibold">🎉 Target achieved!</p>
              )}
            </div>
          </div>
        )}

        {targets.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>All Targets</h3></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Month</th><th>Target</th><th>Saved</th><th>Progress</th></tr></thead>
                <tbody>
                  {targets.map(t => {
                    const saved = getMonthSaved(t.month, t.year)
                    const prog = t.targetPaise > 0 ? Math.min(100, Math.round((saved / t.targetPaise) * 100)) : 0
                    return (
                      <tr key={t.id}>
                        <td className="font-semibold">{format(new Date(t.year, t.month - 1, 1), 'MMMM yyyy')}</td>
                        <td>{formatCurrency(t.targetPaise)}</td>
                        <td className="text-gold font-semibold">{formatCurrency(saved)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <div className="progress-fill" style={{ width: `${prog}%` }} />
                            </div>
                            <span className="text-sm font-semibold">{prog}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
