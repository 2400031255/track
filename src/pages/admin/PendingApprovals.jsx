import { useEffect, useState } from 'react'
import { getLoans, approveLoan, rejectLoan } from '../../services/loanService'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'
import { CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PendingApprovals() {
  const { user } = useAuth()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getLoans({ status: 'pending' }).then(data => { setLoans(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id) => {
    setSaving(true)
    try {
      await approveLoan(id, user.uid)
      toast.success('Loan approved')
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return toast.error('Enter rejection reason')
    setSaving(true)
    try {
      await rejectLoan(rejectModal, user.uid, reason)
      toast.success('Loan rejected')
      setRejectModal(null)
      setReason('')
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Approvals</h1>
          <p className="page-subtitle">{loans.length} loan{loans.length !== 1 ? 's' : ''} awaiting review</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : loans.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={40} />
              <h3>All caught up!</h3>
              <p>No loans pending approval</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Loan ID</th><th>Borrower</th><th>Principal</th><th>Monthly Interest</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id}>
                    <td className="text-gold font-semibold text-sm">{l.loanId}</td>
                    <td>
                      <div className="font-semibold">{l.borrowerName}</div>
                      <div className="text-gray text-xs">{l.borrowerPhone}</div>
                    </td>
                    <td className="font-semibold">{formatCurrency(l.principalPaise)}</td>
                    <td>{formatCurrency(l.monthlyInterestPaise)}</td>
                    <td className="text-gray text-sm">{formatDate(l.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(l.id)} disabled={saving}>
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(l.id)} disabled={saving}>
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold" style={{ fontSize: 16 }}>Reject Loan</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <form onSubmit={handleReject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Rejection Reason *</label>
                  <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this loan is being rejected..." required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setRejectModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={saving}>{saving ? 'Rejecting...' : 'Reject Loan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
