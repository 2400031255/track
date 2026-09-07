import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp, runTransaction, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { toPaise } from '../utils/currency'

const COL = 'payments'

export const recordPayment = async (data, userId) => {
  const amountPaise = toPaise(data.amount)

  await runTransaction(db, async (tx) => {
    const loanRef = doc(db, 'loans', data.loanId)
    const loanSnap = await tx.get(loanRef)
    if (!loanSnap.exists()) throw new Error('Loan not found')
    const loan = loanSnap.data()

    const updates = { updatedAt: serverTimestamp() }

    if (data.paymentType === 'interest') {
      updates.totalInterestCollectedPaise = (loan.totalInterestCollectedPaise || 0) + amountPaise
    } else if (data.paymentType === 'principal') {
      updates.remainingPrincipalPaise = Math.max(0, (loan.remainingPrincipalPaise || 0) - amountPaise)
      if (updates.remainingPrincipalPaise === 0) updates.status = 'completed'
    } else if (data.paymentType === 'both') {
      const interestPart = toPaise(data.interestAmount || 0)
      const principalPart = toPaise(data.principalAmount || 0)
      updates.totalInterestCollectedPaise = (loan.totalInterestCollectedPaise || 0) + interestPart
      updates.remainingPrincipalPaise = Math.max(0, (loan.remainingPrincipalPaise || 0) - principalPart)
      if (updates.remainingPrincipalPaise === 0) updates.status = 'completed'
    } else if (data.paymentType === 'latefee') {
      updates.totalLateFeeCollectedPaise = (loan.totalLateFeeCollectedPaise || 0) + amountPaise
    }

    tx.update(loanRef, updates)

    const payRef = doc(collection(db, COL))
    tx.set(payRef, {
      ...data,
      amountPaise,
      loanId: data.loanId,
      borrowerId: data.borrowerId,
      createdBy: userId,
      paymentDate: Timestamp.fromDate(new Date(data.paymentDate)),
      createdAt: serverTimestamp(),
    })
  })

  await logActivity(userId, `Recorded payment of ₹${data.amount} for loan`, 'payment', data.loanId)
}

export const getPayments = async (loanId) => {
  const snap = await getDocs(query(collection(db, COL), where('loanId', '==', loanId), orderBy('paymentDate', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getAllPayments = async () => {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const logActivity = async (userId, action, type, refId) => {
  try {
    await addDoc(collection(db, 'activityLogs'), { userId, action, type, refId, createdAt: serverTimestamp() })
  } catch {}
}
