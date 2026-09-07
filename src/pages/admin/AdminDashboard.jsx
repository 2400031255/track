import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Users, Package, PiggyBank, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { getLoans } from '../../services/loanService'
import { getSavings, getSavingsTargets } from '../../services/savingsService'
import { getAllCollateral } from '../../services/collateralService'
import { getBorrowers } from '../../services/borrowerService'
import { formatCurrency, toRupees } from '../../utils/currency'
import { isToday, isThisMonth, daysRemainingInMonth } from '../../utils/dates'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, subMonths } from 'date-fns'
import './AdminDashboard.css'

const COLORS = ['#6F8F72', '#C8924A', '#B85C5C', '#B08D57']

export default function AdminDashboard() {
  const [loans, setLoans] = useState([])
  const [savings, setSavings] = useState([])
  const [targets, setTargets] = useState([])
  const [collateral, setCollateral] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getLoans(), getSavings(), getSavingsTargets(), getAllCollateral(), getBorrowers()])
      .then(([l, s, t, c, b]) => { setLoans(l); setSavings(s); setTargets(t); setCollateral(c); setBorrowers(b) })
      .finally(() => setLoading(false))
  }, [])

  // Lending stats
  const activeLoans = loans.filter(l => l.status === 'active')
  const overdueLoans = loans.filter(l => l.status === 'overdue')
  const pendingLoans = loans.filter(l => l.status === 'pending')
  const totalPrincipalPaise = activeLoans.reduce((s, l) => s + (l.principalPaise || 0), 0)
  const totalInterestCollected = activeLoans.reduce((s, l) => s + (l.totalInterestCollectedPaise || 0), 0)
  const monthlyInterestExpected = activeLoans.reduce((s, l) => s + (l.monthlyInterestPaise || 0), 0)

  // Savings stats
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const totalSavedPaise = savings.reduce((s, e) => s + (e.amountPaise || 0), 0)
  const monthSavedPaise = savings.filter(e => isThisMonth(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)
  const todaySavedPaise = savings.filter(e => isToday(e.date)).reduce((s, e) => s + (e.amountPaise || 0), 0)
  const currentTarget = targets.find(t => t.month === currentMonth && t.year === currentYear)
  const targetPaise = currentTarget?.targetPaise || 0
  const targetProgress = targetPaise > 0 ? Math.min(100, Math.round((monthSavedPaise / targetPaise) * 100)) : 0
  const remainingPaise = Math.max(0, targetPaise - monthSavedPaise)
  const daysLeft = daysRemainingInMonth()
  const dailyRequired = daysLeft > 0 && remainingPaise > 0 ? Math.round(toRupees(remainingPaise) / daysLeft) : 0

  // Collateral stats
  const heldItems = collateral.filter(c => c.status === 'held')
  const returnedItems = collateral.filter(c => c.status === 'returned')

  // Chart data
  const loanStatusData = [
    { name: 'Active', value: activeLoans.length },
    { name: 'Overdue', value: overdueLoans.length },
    { name: 'Pending', value: pendingLoans.length },
    { name: 'Completed', value: loans.filter(l => l.status === 'completed').length },
  ].filter(d => d.value > 0)

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const m = subMonths(now, 5 - i)
    const label = format(m, 'MMM')
    const monthSavings = savings.filter(s => {
      const d = s.date?.toDate ? s.date.toDate() : new Date(s.date)
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
    }).reduce((sum, s) => sum + toRupees(s.amountPaise || 0), 0)
    return { month: label, savings: monthSavings }
  })

  const collateralCats = {}
  heldItems.forEach(c => { collateralCats[c.category] = (collateralCats[c.category] || 0) + 1 })
  const collateralData = Object.entries(collateralCats).map(([name, value]) => ({ name, value }))

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's your business overview</p>
        </div>
        <Link to="/admin/loans/new" className="btn btn-gold">
          + New Loan
        </Link>
      </div>

      {/* Lending Overview */}
      <section className="dashboard-section">
        <h2 className="section-title">Lending Overview</h2>
        <div className="stats-grid-4">
          <StatCard label="Total Active Principal" value={formatCurrency(totalPrincipalPaise)} icon={TrendingUp} color="gold" />
          <StatCard label="Active Loans" value={activeLoans.length} icon={CheckCircle} color="success" />
          <StatCard label="Monthly Interest Expected" value={formatCurrency(monthlyInterestExpected)} icon={TrendingUp} color="warning" />
          <StatCard label="Overdue Loans" value={overdueLoans.length} icon={AlertCircle} color="danger" />
        </div>
        <div className="stats-grid-4" style={{ marginTop: 12 }}>
          <StatCard label="Interest Collected" value={formatCurrency(totalInterestCollected)} icon={CheckCircle} color="success" />
          <StatCard label="Pending Approvals" value={pendingLoans.length} icon={Clock} color="warning" />
          <StatCard label="Total Borrowers" value={borrowers.length} icon={Users} color="default" />
          <StatCard label="Total Loans" value={loans.length} icon={TrendingUp} color="default" />
        </div>
      </section>

      {/* Savings Overview */}
      <section className="dashboard-section">
        <h2 className="section-title">Savings Overview</h2>
        <div className="stats-grid-4">
          <StatCard label="Total Savings" value={formatCurrency(totalSavedPaise)} icon={PiggyBank} color="gold" />
          <StatCard label="Saved Today" value={formatCurrency(todaySavedPaise)} icon={PiggyBank} color="success" />
          <StatCard label="Saved This Month" value={formatCurrency(monthSavedPaise)} icon={PiggyBank} color="default" />
          <StatCard label="Monthly Target" value={formatCurrency(targetPaise)} icon={PiggyBank} color="warning" />
        </div>
        {targetPaise > 0 && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-body">
              <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
                <div>
                  <span className="font-semibold">{format(now, 'MMMM yyyy')} Target</span>
                  <span className="text-gray text-sm" style={{ marginLeft: 8 }}>{targetProgress}% completed</span>
                </div>
                <span className="text-gold font-bold">{formatCurrency(monthSavedPaise)} / {formatCurrency(targetPaise)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${targetProgress}%` }} />
              </div>
              {remainingPaise > 0 && (
                <p className="text-sm text-gray" style={{ marginTop: 8 }}>
                  {formatCurrency(remainingPaise)} remaining · {daysLeft} days left · ₹{dailyRequired.toLocaleString('en-IN')}/day required
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Collateral Overview */}
      <section className="dashboard-section">
        <h2 className="section-title">Collateral Overview</h2>
        <div className="stats-grid-4">
          <StatCard label="Items Held" value={heldItems.length} icon={Package} color="warning" />
          <StatCard label="Returned Items" value={returnedItems.length} icon={CheckCircle} color="success" />
          <StatCard label="Total Collateral" value={collateral.length} icon={Package} color="default" />
          <StatCard label="Ready for Return" value={collateral.filter(c => c.status === 'ready').length} icon={Package} color="gold" />
        </div>
      </section>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Savings</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6E675F' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6E675F' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Savings']} contentStyle={{ borderRadius: 8, border: '1px solid #E2D9CE', fontSize: 13 }} />
                <Bar dataKey="savings" fill="#B08D57" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Loan Status</h3>
          </div>
          <div className="card-body">
            {loanStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={loanStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {loanStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2D9CE', fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p>No loan data yet</p></div>
            )}
          </div>
        </div>

        {collateralData.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Collateral by Category</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={collateralData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                    {collateralData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2D9CE', fontSize: 13 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      {pendingLoans.length > 0 && (
        <div className="alert-banner">
          <AlertCircle size={16} />
          <span>{pendingLoans.length} loan{pendingLoans.length > 1 ? 's' : ''} pending approval</span>
          <Link to="/admin/approvals" className="alert-link">Review now <ArrowRight size={14} /></Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    gold: { bg: 'rgba(176,141,87,0.12)', color: '#B08D57' },
    success: { bg: 'rgba(111,143,114,0.12)', color: '#6F8F72' },
    warning: { bg: 'rgba(200,146,74,0.12)', color: '#C8924A' },
    danger: { bg: 'rgba(184,92,92,0.12)', color: '#B85C5C' },
    default: { bg: 'rgba(43,41,38,0.06)', color: '#6E675F' },
  }
  const c = colorMap[color] || colorMap.default
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: c.bg }}>
        <Icon size={18} style={{ color: c.color }} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
