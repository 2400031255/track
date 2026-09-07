import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getLoans } from '../../services/loanService'
import { formatDate } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLoans({ createdBy: user.uid }).then(data => { setLoans(data); setLoading(false) })
  }, [user.uid])

  const pending = loans.filter(l => l.status === 'pending')
  const approved = loans.filter(l => l.status === 'active')
  const rejected = loans.filter(l => l.status === 'rejected')

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Welcome, {user.name}</p>
        </div>
        <Link to="/employee/loans/new" className="btn btn-gold"><Plus size={16} /> New Lending</Link>
      </div>

      <div className="stats-grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(43,41,38,0.06)' }}><FileText size={18} style={{ color: 'var(--gray)' }} /></div>
          <div className="stat-value">{loans.length}</div>
          <div className="stat-label">Total Submitted</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(200,146,74,0.12)' }}><Clock size={18} style={{ color: 'var(--warning)' }} /></div>
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(111,143,114,0.12)' }}><CheckCircle size={18} style={{ color: 'var(--success)' }} /></div>
          <div className="stat-value">{approved.length}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(184,92,92,0.12)' }}><XCircle size={18} style={{ color: 'var(--danger)' }} /></div>
          <div className="stat-value">{rejected.length}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>My Records</h3>
          <Link to="/employee/loans" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : loans.length === 0 ? (
            <div className="empty-state">
              <h3>No records yet</h3>
              <p>Submit your first lending record</p>
              <Link to="/employee/loans/new" className="btn btn-gold" style={{ marginTop: 12 }}>+ New Lending</Link>
            </div>
          ) : (
            <table>
              <thead><tr><th>Loan ID</th><th>Borrower</th><th>Principal</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>
                {loans.slice(0, 10).map(l => (
                  <tr key={l.id}>
                    <td className="text-gold font-semibold text-sm">{l.loanId}</td>
                    <td className="font-semibold">{l.borrowerName}</td>
                    <td>{formatCurrency(l.principalPaise)}</td>
                    <td>
                      <span className={`badge badge-${l.status}`}>{l.status}</span>
                      {l.status === 'rejected' && l.rejectionReason && (
                        <div className="text-danger text-xs" style={{ marginTop: 2 }}>{l.rejectionReason}</div>
                      )}
                    </td>
                    <td className="text-gray text-sm">{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
