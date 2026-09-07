import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { toPaise } from '../utils/currency'

const COL = 'savings'
const TARGET_COL = 'savingsTargets'

export const addSavings = async (data, userId) => {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    amountPaise: toPaise(data.amount),
    date: Timestamp.fromDate(new Date(data.date)),
    createdBy: userId,
    createdAt: serverTimestamp(),
  })
  await logActivity(userId, `Added savings of ₹${data.amount}`, 'savings', ref.id)
  return ref.id
}

export const getSavings = async () => {
  const snap = await getDocs(query(collection(db, COL), orderBy('date', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const setSavingsTarget = async (data, userId) => {
  const snap = await getDocs(query(collection(db, TARGET_COL)))
  const existing = snap.docs.find(d => d.data().month === data.month && d.data().year === data.year)
  if (existing) {
    await updateDoc(doc(db, TARGET_COL, existing.id), { targetPaise: toPaise(data.target), updatedAt: serverTimestamp() })
  } else {
    await addDoc(collection(db, TARGET_COL), { month: data.month, year: data.year, targetPaise: toPaise(data.target), createdBy: userId, createdAt: serverTimestamp() })
  }
}

export const getSavingsTargets = async () => {
  const snap = await getDocs(query(collection(db, TARGET_COL), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const logActivity = async (userId, action, type, refId) => {
  try {
    await addDoc(collection(db, 'activityLogs'), { userId, action, type, refId, createdAt: serverTimestamp() })
  } catch {}
}
