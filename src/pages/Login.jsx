import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { loginUser, resetPassword } from '../firebase/auth'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './Login.css'

// Username → email map. Add more users here as needed.
const USERNAME_MAP = {
  nikhil: 'nikhil@dhanatrack.app',
}

function resolveEmail(input) {
  const trimmed = input.trim().toLowerCase()
  // If it looks like an email already, use it directly
  if (trimmed.includes('@')) return trimmed
  // Otherwise look up in username map
  return USERNAME_MAP[trimmed] || `${trimmed}@dhanatrack.app`
}

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const email = resolveEmail(form.username)
      const user = await loginUser(email, form.password)
      setUser(user)
      navigate(user.role === 'admin' ? '/admin' : '/employee')
    } catch (err) {
      toast.error('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!form.username) return toast.error('Enter your username or email')
    setLoading(true)
    try {
      const email = resolveEmail(form.username)
      await resetPassword(email)
      toast.success('Password reset email sent!')
      setForgotMode(false)
    } catch {
      toast.error('Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">₹</div>
          <h1 className="login-title">DhanaTrack</h1>
          <p className="login-tagline">Lending. Collateral. Savings. Simplified.</p>
        </div>

        {!forgotMode ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input with-icon"
                  placeholder="nikhil"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input with-icon with-icon-right"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-gold btn-lg login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button type="button" className="forgot-link" onClick={() => setForgotMode(true)}>
              Forgot password?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="login-form">
            <p className="forgot-desc">Enter your username or email to receive a reset link.</p>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input with-icon"
                  placeholder="nikhil"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-gold btn-lg login-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" className="forgot-link" onClick={() => setForgotMode(false)}>
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
