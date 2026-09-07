import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, AlertCircle } from 'lucide-react'
import { getLoans } from '../../services/loanService'
import { formatDate, daysOverdue } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'
import { calculateLateFee } from '../../utils/calculations'

export default function LoansList({ status }) {
  const [loans, setLoans] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const titleMap = { active: 'Active Loans', overdue: 'Overdue Loans', completed: 'Completed Loans', pending: 'Pending Loans' }

  useEffect(() => {
    setLoading(true)
    getLoans({ status }).then(data => {
      setLoans(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [status])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(loans.filter(l =>
      l.borrowerName?.toLowerCase().includes(q) ||
      l.loanId?.toLowerCase().includes(q)
    ))
  }, [search, loans])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{titleMap[status] || 'Loans'}</h1>
          <p className="page-subtitle">{filtered.length} records</p>
        </div>
        <Link to="/admin/loans/new" className="btn btn-gold">+ New Loan</Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={15} style={{ color: 'var(--sand)' }} />
            <input placeholder="Search by name or loan ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={40} />
              <h3>No {status} loans</h3>
              <p>Loans with {status} status will appear here</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Borrower</th>
                  <th>Principal</th>
                  <th>Monthly Interest</th>
                  <th>Remaining</th>
                  <th>Date</th>
                  {status === 'overdue' && <th>Days Overdue</th>}
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const overdueDays = status === 'overdue' ? daysOverdue(l.loanDate) : 0
                  return (
                    <tr key={l.id}>
                      <td><span className="text-gold font-semibold text-sm">{l.loanId}</span></td>
                      <td><span className="font-semibold">{l.borrowerName}</span></td>
                      <td className="font-semibold">{formatCurrency(l.principalPaise)}</td>
                      <td>{formatCurrency(l.monthlyInterestPaise)}</td>
                      <td>{formatCurrency(l.remainingPrincipalPaise)}</td>
                      <td className="text-gray text-sm">{formatDate(l.loanDate)}</td>
                      {status === 'overdue' && <td><span className="text-danger font-semibold">{overdueDays}d</span></td>}
                      <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                      <td><Link to={`/admin/loans/${l.id}`} className="btn btn-outline btn-sm"><Eye size={13} /></Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
