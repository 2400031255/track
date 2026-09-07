import { useEffect, useState } from 'react'
import { getAllPayments } from '../../services/paymentService'
import { formatDate } from '../../utils/dates'
import { formatCurrency } from '../../utils/currency'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPayments().then(data => { setPayments(data); setLoading(false) })
  }, [])

  const total = payments.reduce((s, p) => s + (p.amountPaise || 0), 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments & Collections</h1>
          <p className="page-subtitle">{payments.length} total payments</p>
        </div>
        <div className="stat-card" style={{ padding: '10px 20px' }}>
          <div className="stat-label">Total Collected</div>
          <div className="stat-value text-gold">{formatCurrency(total)}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : payments.length === 0 ? (
            <div className="empty-state"><h3>No payments yet</h3></div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Loan ID</th><th>Type</th><th>Amount</th><th>Method</th><th>Notes</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="text-sm">{formatDate(p.paymentDate)}</td>
                    <td className="text-gold text-sm font-semibold">{p.loanId}</td>
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
    </div>
  )
}
