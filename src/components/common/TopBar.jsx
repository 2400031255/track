import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './TopBar.css'

export default function TopBar({ onMenuToggle, title }) {
  const { user } = useAuth()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name}</span>
            <span className="topbar-user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
