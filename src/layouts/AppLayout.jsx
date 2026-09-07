import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import TopBar from '../components/common/TopBar'

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/borrowers': 'Borrowers',
  '/admin/loans/new': 'New Loan',
  '/admin/loans/active': 'Active Loans',
  '/admin/loans/overdue': 'Overdue Loans',
  '/admin/loans/completed': 'Completed Loans',
  '/admin/payments': 'Payments & Collections',
  '/admin/collateral/held': 'Currently Held',
  '/admin/collateral/ready': 'Ready for Return',
  '/admin/collateral/returned': 'Returned Items',
  '/admin/collateral/new': 'Add Collateral',
  '/admin/savings': 'Savings History',
  '/admin/savings/add': 'Add Savings',
  '/admin/savings/targets': 'Savings Targets',
  '/admin/reports': 'Reports & Analytics',
  '/admin/approvals': 'Pending Approvals',
  '/admin/employees': 'Employees',
  '/admin/logs': 'Activity Logs',
  '/admin/settings': 'Settings',
  '/employee': 'My Dashboard',
  '/employee/loans': 'My Records',
  '/employee/loans/new': 'New Lending',
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'DhanaTrack'

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) setMobileOpen(p => !p)
    else setCollapsed(p => !p)
  }

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
      />
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <TopBar title={title} onMenuToggle={toggleSidebar} />
        <Outlet />
      </div>
    </div>
  )
}
