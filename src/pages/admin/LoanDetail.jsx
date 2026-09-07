import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { getLoan } from '../../services/loanService'
import { getPayments, recordPayment } from '../../services/paymentService'
import { getCollateral } from '../../services/collateralService'
import { useAuth } from '../../context/AuthContext'
import { formatDate, daysOverdue } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'
import { calculateLateFee } from '../../utils/calculations'
import toast from 'react-hot-toast'

export default function LoanDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [loan, setLoan] = useState(null)
  const [payments, setPayments] = useState([])
  const [collateral, setCollateral] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [payForm, setPayForm] = useState({
    paymentType: 'interest', amount: '', interestAmount: '', principalAmount: '',
    paymentDate: new Date().toISOString().split('T')[0], paymentMethod: 'cash', notes: ''
  })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [l, p, c] = await Promise.all([getLoan(id), getPayments(id), getCollateral(id)])
    setLoan(l); setPayments(p); setCollateral(c); setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const overdueDays = loan ? daysOverdue(loan.loanDate) : 0
  const lateFee = loan ? calculateLateFee(loan.monthlyInterestPaise, loan.lateFeePerDay, overdueDays) : 0

  const handlePayment = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await recordPayment({ ...payForm, loanId: id, borrowerId: loan.borrowerId }, user.uid)
      toast.success('Payment recorded')
      setShowPayModal(false)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>
  if (!loan) return <div className="page-container"><p>Loan not found.</p></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link to="/admin/loans/active" className="btn btn-outline btn-sm btn-icon"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="page-title">{loan.loanId}</h1>
            <p className="page-subtitle">{loan.borrowerName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`badge badge-${loan.status}`} style={{ fontSize: 13, padding: '6px 14px' }}>{loan.status}</span>
          {user.role === 'admin' && loan.status === 'active' && (
            <button className="btn btn-gold" onClick={() => setShowPayModal(true)}><Plus size={15} /> Record Payment</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Loan Summary</h3></div>
          <div className="card-body">
            <InfoRow label="Principal" value={<span className="font-bold text-gold" style={{ fontSize: 18 }}>{formatCurrency(loan.principalPaise)}</span>} />
            <InfoRow label="Remaining Principal" value={formatCurrency(loan.remainingPrincipalPaise)} />
            <InfoRow label="Monthly Interest" value={formatCurrency(loan.monthlyInterestPaise)} />
            <InfoRow label="Interest Collected" value={<span className="text-success">{formatCurrency(loan.totalInterestCollectedPaise)}</span>} />
            <InfoRow label="Late Fee Collected" value={formatCurrency(loan.totalLateFeeCollectedPaise)} />
            <InfoRow label="Loan Date" value={formatDate(loan.loanDate)} />
            <InfoRow label="Due Date" value={`${loan.monthlyDueDate} of every month`} />
            {loan.lateFeePerDay && <InfoRow label="Late Fee/Day" value={`₹${loan.lateFeePerDay}`} />}
            {loan.notes && <InfoRow label="Notes" value={loan.notes} />}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Current Status</h3></div>
          <div className="card-body">
            {loan.status === 'active' && overdueDays > 0 && (
              <div style={{ background: 'rgba(184,92,92,0.08)', border: '1px solid rgba(184,92,92,0.2)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <p className="text-danger font-semibold">⚠ Overdue by {overdueDays} days</p>
                <p className="text-sm text-gray">Late fee: {formatCurrency(lateFee)}</p>
                <p className="text-sm font-semibold" style={{ marginTop: 4 }}>Total due: {formatCurrency(loan.monthlyInterestPaise + lateFee)}</p>
              </div>
            )}
            <InfoRow label="Interest Type" value={loan.interestType === 'fixed' ? 'Fixed Amount' : 'Percentage'} />
            <InfoRow label="Interest Value" value={loan.interestType === 'fixed' ? `₹${loan.interestValue}/month` : `${loan.interestValue}%`} />
            {loan.approvedBy && <InfoRow label="Approved By" value={loan.approvedBy} />}
            {loan.rejectionReason && <InfoRow label="Rejection Reason" value={<span className="text-danger">{loan.rejectionReason}</span>} />}
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Payment History</h3>
            <span className="text-gray text-sm">{payments.length} payments</span>
          </div>
          <div className="table-wrapper">
            {payments.length === 0 ? (
              <div className="empty-state"><p>No payments recorded yet</p></div>
            ) : (
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Method</th><th>Notes</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="text-sm">{formatDate(p.paymentDate)}</td>
                      <td><span className="badge badge-active" style={{ textTransform: 'capitalize' }}>{p.paymentType}</span></td>
                      <td className="font-semibold text-success">{formatCurrency(p.amountPaise)}</td>
                      <td className="text-gray text-sm">{p.paymentMethod}</td>
                      <td className="text-gray text-sm">{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {collateral.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Collateral Items</h3>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>ID</th><th>Item</th><th>Category</th><th>Value</th><th>Status</th><th>Photos</th></tr></thead>
                <tbody>
                  {collateral.map(c => (
                    <tr key={c.id}>
                      <td className="text-gold text-sm font-semibold">{c.collateralId}</td>
                      <td className="font-semibold">{c.itemName}</td>
                      <td>{c.category}</td>
                      <td>{formatCurrency(c.estimatedValuePaise)}</td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td className="text-gray text-sm">{c.photos?.length || 0} photos</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold" style={{ fontSize: 16 }}>Record Payment</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Payment Type</label>
                  <select className="form-select" value={payForm.paymentType} onChange={e => setPayForm(p => ({ ...p, paymentType: e.target.value }))}>
                    <option value="interest">Interest Payment</option>
                    <option value="principal">Principal Payment</option>
                    <option value="both">Interest + Principal</option>
                    <option value="latefee">Late Fee</option>
                  </select>
                </div>
                {payForm.paymentType === 'both' ? (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Interest Amount (₹)</label>
                      <input type="number" className="form-input" value={payForm.interestAmount}
                        onChange={e => setPayForm(p => ({ ...p, interestAmount: e.target.value, amount: String(Number(e.target.value) + Number(p.principalAmount || 0)) }))} min="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Principal Amount (₹)</label>
                      <input type="number" className="form-input" value={payForm.principalAmount}
                        onChange={e => setPayForm(p => ({ ...p, principalAmount: e.target.value, amount: String(Number(p.interestAmount || 0) + Number(e.target.value)) }))} min="0" />
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input type="number" className="form-input" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} required min="1" />
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Payment Date *</label>
                    <input type="date" className="form-input" value={payForm.paymentDate} onChange={e => setPayForm(p => ({ ...p, paymentDate: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" value={payForm.paymentMethod} onChange={e => setPayForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowPayModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Saving...' : 'Record Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="text-gray text-sm">{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  )
}
