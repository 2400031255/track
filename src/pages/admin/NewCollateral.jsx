import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Camera, X, Upload } from 'lucide-react'
import { addCollateral } from '../../services/collateralService'
import { getBorrowers } from '../../services/borrowerService'
import { getLoans } from '../../services/loanService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['Phone', 'Bike', 'Car', 'Other Vehicle', 'Gold', 'Jewellery', 'Laptop', 'Electronics', 'Documents', 'Other']
const PHOTO_LABELS = ['Front', 'Back', 'Side', 'Serial Number', 'Vehicle Number', 'Additional']

export default function NewCollateral() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [borrowers, setBorrowers] = useState([])
  const [loans, setLoans] = useState([])
  const [photos, setPhotos] = useState([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    borrowerId: searchParams.get('borrowerId') || '',
    loanId: searchParams.get('loanId') || '',
    borrowerName: '',
    category: 'Phone',
    itemName: '',
    brand: '',
    model: '',
    serialNumber: '',
    vehicleRegNumber: '',
    estimatedValue: '',
    condition: 'Good',
    description: '',
  })

  useEffect(() => {
    getBorrowers().then(setBorrowers)
    if (form.borrowerId) getLoans({ borrowerId: form.borrowerId }).then(l => setLoans(l.filter(x => x.borrowerId === form.borrowerId && x.status === 'active')))
  }, [])

  useEffect(() => {
    if (form.borrowerId) {
      const b = borrowers.find(b => b.id === form.borrowerId)
      if (b) setForm(p => ({ ...p, borrowerName: b.name }))
      getLoans().then(l => setLoans(l.filter(x => x.borrowerId === form.borrowerId && x.status === 'active')))
    }
  }, [form.borrowerId, borrowers])

  const handlePhoto = (e, label) => {
    const file = e.target.files[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setPhotos(p => [...p.filter(x => x.label !== label), { label, file, preview }])
  }

  const removePhoto = (label) => setPhotos(p => p.filter(x => x.label !== label))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.borrowerId || !form.loanId) return toast.error('Select borrower and loan')
    setSaving(true)
    try {
      await addCollateral(form, photos, user.uid)
      toast.success('Collateral added')
      navigate(-1)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-outline btn-sm btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={16} /></button>
          <div>
            <h1 className="page-title">Add Collateral</h1>
            <p className="page-subtitle">Record a new collateral item</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Loan Reference</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Borrower *</label>
                <select className="form-select" value={form.borrowerId} onChange={e => set('borrowerId', e.target.value)} required>
                  <option value="">— Select borrower —</option>
                  {borrowers.map(b => <option key={b.id} value={b.id}>{b.name} · {b.phone}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Loan *</label>
                <select className="form-select" value={form.loanId} onChange={e => set('loanId', e.target.value)} required disabled={!form.borrowerId}>
                  <option value="">— Select loan —</option>
                  {loans.map(l => <option key={l.id} value={l.id}>{l.loanId}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Item Details</h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input className="form-input" value={form.itemName} onChange={e => set('itemName', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input className="form-input" value={form.model} onChange={e => set('model', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Serial Number</label>
                  <input className="form-input" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Reg. No.</label>
                  <input className="form-input" value={form.vehicleRegNumber} onChange={e => set('vehicleRegNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Value (₹)</label>
                  <input type="number" className="form-input" value={form.estimatedValue} onChange={e => set('estimatedValue', e.target.value)} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select className="form-select" value={form.condition} onChange={e => set('condition', e.target.value)}>
                    {['Excellent', 'Good', 'Fair', 'Poor'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Photographs</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {PHOTO_LABELS.map(label => {
                  const existing = photos.find(p => p.label === label)
                  return (
                    <div key={label} style={{ position: 'relative' }}>
                      <label style={{ cursor: 'pointer', display: 'block' }}>
                        <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handlePhoto(e, label)} />
                        <div style={{
                          border: '2px dashed var(--border)', borderRadius: 8, height: 120,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: 6, background: existing ? 'transparent' : 'var(--beige)',
                          overflow: 'hidden', position: 'relative'
                        }}>
                          {existing ? (
                            <img src={existing.preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <>
                              <Camera size={20} style={{ color: 'var(--sand)' }} />
                              <span style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 600 }}>{label}</span>
                            </>
                          )}
                        </div>
                      </label>
                      {existing && (
                        <button type="button" onClick={() => removePhoto(label)} style={{
                          position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)',
                          border: 'none', borderRadius: '50%', width: 22, height: 22,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                        }}>
                          <X size={12} />
                        </button>
                      )}
                      <p style={{ fontSize: 11, color: 'var(--gray)', textAlign: 'center', marginTop: 4 }}>{label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-gold btn-lg" disabled={saving}>
            {saving ? 'Uploading...' : 'Save Collateral'}
          </button>
        </div>
      </form>
    </div>
  )
}
