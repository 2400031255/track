import { useEffect, useState } from 'react'
import { getActivityLogs } from '../../services/activityService'
import { formatDateTime } from '../../utils/dates'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivityLogs(100).then(data => { setLogs(data); setLoading(false) })
  }, [])

  const typeColor = { loan: 'badge-active', payment: 'badge-completed', collateral: 'badge-pending', savings: 'badge-held', employee: 'badge-active', borrower: 'badge-held' }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">Complete audit trail of all actions</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : logs.length === 0 ? (
            <div className="empty-state"><h3>No activity yet</h3></div>
          ) : (
            <table>
              <thead><tr><th>Time</th><th>Action</th><th>Type</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="text-gray text-sm" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(l.createdAt)}</td>
                    <td>{l.action}</td>
                    <td><span className={`badge ${typeColor[l.type] || 'badge-held'}`}>{l.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
