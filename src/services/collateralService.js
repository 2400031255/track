import { collection, addDoc, updateDoc, doc, getDocs, getDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase/config'
import { generateCollateralId } from '../utils/calculations'
import { toPaise } from '../utils/currency'

const COL = 'collateral'

export const addCollateral = async (data, photos, userId) => {
  const collateralId = generateCollateralId()
  const photoUrls = []

  for (const photo of photos) {
    const storageRef = ref(storage, `collateral/${data.borrowerId}/${data.loanId}/${collateralId}/${photo.label}_${Date.now()}`)
    await uploadBytes(storageRef, photo.file)
    const url = await getDownloadURL(storageRef)
    photoUrls.push({ label: photo.label, url })
  }

  const ref2 = await addDoc(collection(db, COL), {
    ...data,
    collateralId,
    estimatedValuePaise: toPaise(data.estimatedValue),
    photos: photoUrls,
    status: 'held',
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await logActivity(userId, `Added collateral ${data.itemName} for loan`, 'collateral', ref2.id)
  return ref2.id
}

export const getCollateral = async (loanId) => {
  const snap = await getDocs(query(collection(db, COL), where('loanId', '==', loanId)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getAllCollateral = async (filters = {}) => {
  let q = query(collection(db, COL), orderBy('createdAt', 'desc'))
  if (filters.status) q = query(collection(db, COL), where('status', '==', filters.status), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateCollateralStatus = async (id, status, notes, userId) => {
  const updates = { status, updatedAt: serverTimestamp() }
  if (status === 'returned') { updates.returnedAt = serverTimestamp(); updates.returnNotes = notes }
  await updateDoc(doc(db, COL, id), updates)
  await logActivity(userId, `Updated collateral status to ${status}`, 'collateral', id)
}

const logActivity = async (userId, action, type, refId) => {
  try {
    await addDoc(collection(db, 'activityLogs'), { userId, action, type, refId, createdAt: serverTimestamp() })
  } catch {}
}
