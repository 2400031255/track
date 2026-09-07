import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { changePassword } from '../../firebase/auth'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuth()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  const handlePassword = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await changePassword(form.newPassword)
      toast.success('Password updated successfully')
      setForm({ newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div style={{ maxWidth: 480 }}>
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Account Info</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-gray text-sm">Name</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-gray text-sm">Email</span>
                <span className="font-semibold">{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span className="text-gray text-sm">Role</span>
                <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Change Password</h3></div>
          <form onSubmit={handlePassword}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required minLength={6} />
              </div>
              <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
