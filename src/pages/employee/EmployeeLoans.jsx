import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getLoans } from '../../services/loanService'
import { formatDate } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'
import { Plus } from 'lucide-react'

export default function EmployeeLoans() {
  const { user } = useAuth()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLoans({ createdBy: user.uid }).then(data => { setLoans(data); setLoading(false) })
  }, [user.uid])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Records</h1>
          <p className="page-subtitle">{loans.length} submitted records</p>
        </div>
        <Link to="/employee/loans/new" className="btn btn-gold"><Plus size={16} /> New Lending</Link>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : loans.length === 0 ? (
            <div className="empty-state">
              <h3>No records yet</h3>
              <p>Submit your first lending record</p>
            </div>
          ) : (
            <table>
              <thead><tr><th>Loan ID</th><th>Borrower</th><th>Principal</th><th>Monthly Interest</th><th>Status</th><th>Submitted</th></tr></thead>
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
