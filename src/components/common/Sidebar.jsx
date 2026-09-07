import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, Package, PiggyBank,
  BarChart2, Clock, Bell, Settings, LogOut, ChevronDown,
  ChevronRight, Menu, X, CheckSquare, UserCheck, FileText, Wallet
} from 'lucide-react'
import { logoutUser } from '../../firebase/auth'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const adminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  {
    label: 'Lending', icon: CreditCard, children: [
      { label: 'Add New Loan', path: '/admin/loans/new' },
      { label: 'Active Loans', path: '/admin/loans/active' },
      { label: 'Overdue Loans', path: '/admin/loans/overdue' },
      { label: 'Completed Loans', path: '/admin/loans/completed' },
    ]
  },
  { label: 'Borrowers', icon: Users, path: '/admin/borrowers' },
  { label: 'Payments', icon: Wallet, path: '/admin/payments' },
  {
    label: 'Collateral', icon: Package, children: [
      { label: 'Currently Held', path: '/admin/collateral/held' },
      { label: 'Ready for Return', path: '/admin/collateral/ready' },
      { label: 'Returned Items', path: '/admin/collateral/returned' },
    ]
  },
  {
    label: 'Savings', icon: PiggyBank, children: [
      { label: 'Add Savings', path: '/admin/savings/add' },
      { label: 'Savings History', path: '/admin/savings' },
      { label: 'Savings Targets', path: '/admin/savings/targets' },
    ]
  },
  { label: 'Reports', icon: BarChart2, path: '/admin/reports' },
  { label: 'Pending Approvals', icon: CheckSquare, path: '/admin/approvals' },
  { label: 'Employees', icon: UserCheck, path: '/admin/employees' },
  { label: 'Activity Logs', icon: FileText, path: '/admin/logs' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
]

const employeeNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/employee' },
  { label: 'Add New Lending', icon: CreditCard, path: '/employee/loans/new' },
  { label: 'My Records', icon: FileText, path: '/employee/loans' },
]

export default function Sidebar({ collapsed, mobileOpen, onToggle }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState({})

  const nav = user?.role === 'admin' ? adminNav : employeeNav

  const toggleMenu = (label) => setOpenMenus(p => ({ ...p, [label]: !p[label] }))

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <div className="brand-icon">₹</div>
            <div>
              <div className="brand-name">DhanaTrack</div>
              <div className="brand-tagline">Financial Management</div>
            </div>
          </div>
        )}
        {collapsed && <div className="brand-icon-only">₹</div>}
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <div>
                <button
                  className={`nav-item nav-parent ${openMenus[item.label] ? 'open' : ''}`}
                  onClick={() => toggleMenu(item.label)}
                  title={collapsed ? item.label : ''}
                >
                  <item.icon size={18} className="nav-icon" />
                  {!collapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      <ChevronDown size={14} className={`nav-arrow ${openMenus[item.label] ? 'rotated' : ''}`} />
                    </>
                  )}
                </button>
                {!collapsed && openMenus[item.label] && (
                  <div className="nav-children">
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => `nav-child ${isActive ? 'active' : ''}`}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.path}
                end={item.path === '/admin' || item.path === '/employee'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <item.icon size={18} className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
