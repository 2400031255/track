import { useEffect, useState } from 'react'
import { getEmployees, createEmployee, updateEmployeeStatus } from '../../services/employeeService'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/dates'
import { Plus, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Employees() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getEmployees().then(data => { setEmployees(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createEmployee(form, user.uid)
      toast.success('Employee created')
      setShowModal(false)
      setForm({ name: '', email: '', phone: '', password: '' })
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active'
    try {
      await updateEmployeeStatus(emp.id, newStatus, user.uid)
      toast.success(`Employee ${newStatus}`)
      load()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} employees</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowModal(true)}><Plus size={16} /> Add Employee</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : employees.length === 0 ? (
            <div className="empty-state"><h3>No employees yet</h3><p>Add your first employee</p></div>
          ) : (
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Added</th><th>Actions</th></tr></thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="font-semibold">{emp.name}</td>
                    <td className="text-gray text-sm">{emp.email}</td>
                    <td className="text-gray text-sm">{emp.phone}</td>
                    <td><span className={`badge ${emp.status === 'active' ? 'badge-active' : 'badge-rejected'}`}>{emp.status}</span></td>
                    <td className="text-gray text-sm">{formatDate(emp.createdAt)}</td>
                    <td>
                      <button className={`btn btn-sm ${emp.status === 'active' ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleStatus(emp)}>
                        {emp.status === 'active' ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold" style={{ fontSize: 16 }}>Add Employee</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input type="password" className="form-input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Creating...' : 'Create Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
