import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config'
import { generateBorrowerId } from '../utils/calculations'

const COL = 'borrowers'

export const addBorrower = async (data, userId) => {
  const borrowerId = generateBorrowerId()
  const ref = await addDoc(collection(db, COL), {
    ...data,
    borrowerId,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await logActivity(userId, `Added borrower ${data.name}`, 'borrower', ref.id)
  return ref.id
}

export const getBorrowers = async () => {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getBorrower = async (id) => {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateBorrower = async (id, data, userId) => {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })
  await logActivity(userId, `Updated borrower`, 'borrower', id)
}

const logActivity = async (userId, action, type, refId) => {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      userId, action, type, refId,
      createdAt: serverTimestamp(),
    })
  } catch {}
}
