import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createLoan } from '../../services/loanService'
import { getBorrowers, addBorrower } from '../../services/borrowerService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { calculateMonthlyInterest } from '../../utils/calculations'
import { toPaise, formatCurrency } from '../../utils/currency'

export default function NewLoan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [borrowers, setBorrowers] = useState([])
  const [saving, setSaving] = useState(false)
  const [newBorrower, setNewBorrower] = useState(false)

  const [form, setForm] = useState({
    borrowerId: searchParams.get('borrowerId') || '',
    borrowerName: '',
    borrowerPhone: '',
    borrowerAddress: '',
    principalAmount: '',
    loanDate: new Date().toISOString().split('T')[0],
    durationMonths: '',
    interestType: 'fixed',
    interestValue: '',
    monthlyDueDate: '1',
    lateFeePerDay: '',
    notes: '',
  })

  useEffect(() => {
    getBorrowers().then(setBorrowers)
  }, [])

  useEffect(() => {
    if (form.borrowerId) {
      const b = borrowers.find(b => b.id === form.borrowerId)
      if (b) setForm(p => ({ ...p, borrowerName: b.name, borrowerPhone: b.phone }))
    }
  }, [form.borrowerId, borrowers])

  const monthlyInterest = form.principalAmount && form.interestValue
    ? calculateMonthlyInterest(toPaise(form.principalAmount), form.interestType, form.interestValue)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let borrowerId = form.borrowerId
      if (newBorrower) {
        borrowerId = await addBorrower({ name: form.borrowerName, phone: form.borrowerPhone, address: form.borrowerAddress }, user.uid)
      }
      if (!borrowerId) { toast.error('Select or add a borrower'); setSaving(false); return }
      const b = borrowers.find(b => b.id === borrowerId)
      await createLoan({ ...form, borrowerId, borrowerName: form.borrowerName || b?.name }, user.uid, user.role)
      toast.success(user.role === 'admin' ? 'Loan created and activated' : 'Loan submitted for approval')
      navigate(user.role === 'admin' ? '/admin/loans/active' : '/employee/loans')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-outline btn-sm btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">New Loan</h1>
            <p className="page-subtitle">{user.role === 'employee' ? 'Submit for admin approval' : 'Create and activate loan'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Borrower */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Borrower Details</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setNewBorrower(p => !p)}>
                {newBorrower ? 'Select Existing' : '+ New Borrower'}
              </button>
            </div>
            <div className="card-body">
              {!newBorrower ? (
                <div className="form-group">
                  <label className="form-label">Select Borrower *</label>
                  <select className="form-select" value={form.borrowerId} onChange={e => set('borrowerId', e.target.value)} required>
                    <option value="">— Select borrower —</option>
                    {borrowers.map(b => <option key={b.id} value={b.id}>{b.name} · {b.phone}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.borrowerName} onChange={e => set('borrowerName', e.target.value)} required={newBorrower} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input className="form-input" value={form.borrowerPhone} onChange={e => set('borrowerPhone', e.target.value)} required={newBorrower} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-input" value={form.borrowerAddress} onChange={e => set('borrowerAddress', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Loan Details */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Loan Details</h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Principal Amount (₹) *</label>
                  <input type="number" className="form-input" value={form.principalAmount} onChange={e => set('principalAmount', e.target.value)} required min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Loan Date *</label>
                  <input type="date" className="form-input" value={form.loanDate} onChange={e => set('loanDate', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (months)</label>
                  <input type="number" className="form-input" value={form.durationMonths} onChange={e => set('durationMonths', e.target.value)} min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Due Date</label>
                  <select className="form-select" value={form.monthlyDueDate} onChange={e => set('monthlyDueDate', e.target.value)}>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Interest */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Interest Details</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Interest Type *</label>
                <div className="tabs" style={{ marginBottom: 16 }}>
                  <button type="button" className={`tab ${form.interestType === 'fixed' ? 'active' : ''}`} onClick={() => set('interestType', 'fixed')}>Fixed Amount</button>
                  <button type="button" className={`tab ${form.interestType === 'percentage' ? 'active' : ''}`} onClick={() => set('interestType', 'percentage')}>Percentage</button>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    {form.interestType === 'fixed' ? 'Monthly Interest (₹) *' : 'Interest Rate (%) *'}
                  </label>
                  <input type="number" className="form-input" value={form.interestValue} onChange={e => set('interestValue', e.target.value)} required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Late Fee Per Day (₹)</label>
                  <input type="number" className="form-input" value={form.lateFeePerDay} onChange={e => set('lateFeePerDay', e.target.value)} min="0" />
                </div>
              </div>
              {monthlyInterest > 0 && (
                <div style={{ background: 'rgba(176,141,87,0.08)', border: '1px solid rgba(176,141,87,0.2)', borderRadius: 8, padding: '12px 16px' }}>
                  <p className="text-sm text-gray">Monthly Interest</p>
                  <p className="font-bold text-gold" style={{ fontSize: 20 }}>{formatCurrency(monthlyInterest)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Additional Notes</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional information..." style={{ minHeight: 120 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-gold btn-lg" disabled={saving}>
            {saving ? 'Saving...' : user.role === 'admin' ? 'Create & Activate Loan' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  )
}
