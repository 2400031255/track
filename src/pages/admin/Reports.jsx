import { useEffect, useState } from 'react'
import { getLoans } from '../../services/loanService'
import { getSavings } from '../../services/savingsService'
import { getAllCollateral } from '../../services/collateralService'
import { getAllPayments } from '../../services/paymentService'
import { formatCurrency, toRupees } from '../../utils/currency'
import { isThisMonth, isThisYear } from '../../utils/dates'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subMonths } from 'date-fns'

export default function Reports() {
  const [loans, setLoans] = useState([])
  const [savings, setSavings] = useState([])
  const [collateral, setCollateral] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getLoans(), getSavings(), getAllCollateral(), getAllPayments()])
      .then(([l, s, c, p]) => { setLoans(l); setSavings(s); setCollateral(c); setPayments(p); setLoading(false) })
  }, [])

  const activeLoans = loans.filter(l => l.status === 'active')
  const totalPrincipal = activeLoans.reduce((s, l) => s + (l.principalPaise || 0), 0)
  const totalInterest = loans.reduce((s, l) => s + (l.totalInterestCollectedPaise || 0), 0)
  const totalLateFee = loans.reduce((s, l) => s + (l.totalLateFeeCollectedPaise || 0), 0)
  const totalSavings = savings.reduce((s, e) => s + (e.amountPaise || 0), 0)
  const monthSavings = savings.filter(e => isThisMonth(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)

  const now = new Date()
  const monthlyPayments = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(now, 5 - i)
    const total = payments.filter(p => {
      const d = p.paymentDate?.toDate ? p.paymentDate.toDate() : new Date(p.paymentDate)
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
    }).reduce((sum, p) => sum + toRupees(p.amountPaise || 0), 0)
    return { month: format(m, 'MMM'), amount: total }
  })

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Financial overview and performance metrics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Lending Report</h2>
          <div className="stats-grid-4">
            {[
              { label: 'Active Principal', value: formatCurrency(totalPrincipal) },
              { label: 'Interest Collected', value: formatCurrency(totalInterest) },
              { label: 'Late Fees Collected', value: formatCurrency(totalLateFee) },
              { label: 'Active Loans', value: activeLoans.length },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Monthly Collections</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyPayments}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6E675F' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6E675F' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Collected']} contentStyle={{ borderRadius: 8, border: '1px solid #E2D9CE', fontSize: 13 }} />
                <Bar dataKey="amount" fill="#B08D57" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Savings Report</h2>
          <div className="stats-grid-4">
            {[
              { label: 'Total Savings', value: formatCurrency(totalSavings) },
              { label: 'This Month', value: formatCurrency(monthSavings) },
              { label: 'This Year', value: formatCurrency(savings.filter(e => isThisYear(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)) },
              { label: 'Total Entries', value: savings.length },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value text-gold">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Collateral Report</h2>
          <div className="stats-grid-4">
            {[
              { label: 'Total Items', value: collateral.length },
              { label: 'Currently Held', value: collateral.filter(c => c.status === 'held').length },
              { label: 'Ready for Return', value: collateral.filter(c => c.status === 'ready').length },
              { label: 'Returned', value: collateral.filter(c => c.status === 'returned').length },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
