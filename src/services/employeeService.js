import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../firebase/config'

const COL = 'users'

export const createEmployee = async (data, adminId) => {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password)
  await addDoc(collection(db, COL), {
    uid: cred.user.uid,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: 'employee',
    status: 'active',
    createdBy: adminId,
    createdAt: serverTimestamp(),
  })
  await logActivity(adminId, `Created employee ${data.name}`, 'employee', cred.user.uid)
  return cred.user.uid
}

export const getEmployees = async () => {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'employee')
}

export const updateEmployeeStatus = async (id, status, adminId) => {
  await updateDoc(doc(db, COL, id), { status, updatedAt: serverTimestamp() })
  await logActivity(adminId, `Updated employee status to ${status}`, 'employee', id)
}

const logActivity = async (userId, action, type, refId) => {
  try {
    await addDoc(collection(db, 'activityLogs'), { userId, action, type, refId, createdAt: serverTimestamp() })
  } catch {}
}
