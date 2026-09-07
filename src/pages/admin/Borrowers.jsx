import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Phone, MapPin, Eye } from 'lucide-react'
import { getBorrowers, addBorrower, updateBorrower } from '../../services/borrowerService'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/dates'
import toast from 'react-hot-toast'

export default function Borrowers() {
  const { user } = useAuth()
  const [borrowers, setBorrowers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', altPhone: '', address: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await getBorrowers()
    setBorrowers(data)
    setFiltered(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(borrowers.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.phone?.includes(q) ||
      b.borrowerId?.toLowerCase().includes(q)
    ))
  }, [search, borrowers])

  const openAdd = () => { setEditing(null); setForm({ name: '', phone: '', altPhone: '', address: '', notes: '' }); setShowModal(true) }
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, phone: b.phone, altPhone: b.altPhone || '', address: b.address || '', notes: b.notes || '' }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateBorrower(editing.id, form, user.uid)
        toast.success('Borrower updated')
      } else {
        await addBorrower(form, user.uid)
        toast.success('Borrower added')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Borrowers</h1>
          <p className="page-subtitle">{borrowers.length} total borrowers</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd}><Plus size={16} /> Add Borrower</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={15} style={{ color: 'var(--sand)' }} />
            <input placeholder="Search by name, phone, ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <h3>No borrowers found</h3>
              <p>Add your first borrower to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Borrower ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><span className="text-gold font-semibold text-sm">{b.borrowerId}</span></td>
                    <td><span className="font-semibold">{b.name}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Phone size={13} style={{ color: 'var(--gray)' }} />
                        {b.phone}
                      </div>
                    </td>
                    <td className="text-gray text-sm">{b.address || '—'}</td>
                    <td className="text-gray text-sm">{formatDate(b.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/admin/borrowers/${b.id}`} className="btn btn-outline btn-sm"><Eye size={13} /></Link>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>Edit</button>
                      </div>
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
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold" style={{ fontSize: 16 }}>{editing ? 'Edit Borrower' : 'Add New Borrower'}</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alternative Phone</label>
                    <input className="form-input" value={form.altPhone} onChange={e => setForm(p => ({ ...p, altPhone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Borrower'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
