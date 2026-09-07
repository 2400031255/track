import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase/config'

export const getActivityLogs = async (limitCount = 50) => {
  const snap = await getDocs(query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(limitCount)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
