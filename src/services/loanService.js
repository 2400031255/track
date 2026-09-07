import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { generateLoanId, calculateMonthlyInterest } from '../utils/calculations'
import { toPaise } from '../utils/currency'

const COL = 'loans'

export const createLoan = async (data, userId, role) => {
  const loanId = generateLoanId()
  const principalPaise = toPaise(data.principalAmount)
  const monthlyInterestPaise = calculateMonthlyInterest(principalPaise, data.interestType, data.interestValue)
  const status = role === 'admin' ? 'active' : 'pending'

  const ref = await addDoc(collection(db, COL), {
    ...data,
    loanId,
    principalPaise,
    monthlyInterestPaise,
    remainingPrincipalPaise: principalPaise,
    totalInterestCollectedPaise: 0,
    totalLateFeeCollectedPaise: 0,
    status,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    loanDate: Timestamp.fromDate(new Date(data.loanDate)),
  })
  await logActivity(userId, `Created loan ${loanId} for ${data.borrowerName}`, 'loan', ref.id)
  return ref.id
}

export const getLoans = async (filters = {}) => {
  let q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  if (filters.status) q = query(collection(db, COL), where('status', '==', filters.status), orderBy('createdAt', 'desc'))
  if (filters.createdBy) q = query(collection(db, COL), where('createdBy', '==', filters.createdBy), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getLoan = async (id) => {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const approveLoan = async (id, adminId) => {
  await updateDoc(doc(db, COL, id), { status: 'active', approvedBy: adminId, approvedAt: serverTimestamp(), updatedAt: serverTimestamp() })
  await logActivity(adminId, `Approved loan`, 'loan', id)
}

export const rejectLoan = async (id, adminId, reason) => {
  await updateDoc(doc(db, COL, id), { status: 'rejected', rejectedBy: adminId, rejectionReason: reason, updatedAt: serverTimestamp() })
  await logActivity(adminId, `Rejected loan: ${reason}`, 'loan', id)
}

export const updateLoanStatus = async (id, status, userId) => {
  await updateDoc(doc(db, COL, id), { status, updatedAt: serverTimestamp() })
  await logActivity(userId, `Updated loan status to ${status}`, 'loan', id)
}

export const updateLoanFinancials = async (id, updates) => {
  await updateDoc(doc(db, COL, id), { ...updates, updatedAt: serverTimestamp() })
}

const logActivity = async (userId, action, type, refId) => {
  try {
    await addDoc(collection(db, 'activityLogs'), { userId, action, type, refId, createdAt: serverTimestamp() })
  } catch {}
}
