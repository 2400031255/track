import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin } from 'lucide-react'
import { getBorrower } from '../../services/borrowerService'
import { getLoans } from '../../services/loanService'
import { formatDate } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'

export default function BorrowerDetail() {
  const { id } = useParams()
  const [borrower, setBorrower] = useState(null)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getBorrower(id), getLoans({ borrowerId: id })]).then(([b, l]) => {
      setBorrower(b)
      setLoans(l.filter(loan => loan.borrowerId === id))
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>
  if (!borrower) return <div className="page-container"><p>Borrower not found.</p></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Link to="/admin/borrowers" className="btn btn-outline btn-sm btn-icon"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="page-title">{borrower.name}</h1>
            <p className="page-subtitle">{borrower.borrowerId}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Borrower Info</h3></div>
          <div className="card-body">
            <InfoRow label="Name" value={borrower.name} />
            <InfoRow label="Phone" value={borrower.phone} />
            {borrower.altPhone && <InfoRow label="Alt Phone" value={borrower.altPhone} />}
            {borrower.address && <InfoRow label="Address" value={borrower.address} />}
            <InfoRow label="Added" value={formatDate(borrower.createdAt)} />
            {borrower.notes && <InfoRow label="Notes" value={borrower.notes} />}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Loan History</h3>
            <Link to={`/admin/loans/new?borrowerId=${id}`} className="btn btn-gold btn-sm">+ New Loan</Link>
          </div>
          <div className="table-wrapper">
            {loans.length === 0 ? (
              <div className="empty-state"><p>No loans yet</p></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Principal</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(l => (
                    <tr key={l.id}>
                      <td className="text-gold font-semibold text-sm">{l.loanId}</td>
                      <td className="font-semibold">{formatCurrency(l.principalPaise)}</td>
                      <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                      <td className="text-gray text-sm">{formatDate(l.loanDate)}</td>
                      <td><Link to={`/admin/loans/${l.id}`} className="btn btn-outline btn-sm">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span className="text-gray text-sm">{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}
