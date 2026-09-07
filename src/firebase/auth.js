import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './config'

export const loginUser = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const snap = await getDoc(doc(db, 'users', cred.user.uid))
  if (!snap.exists()) throw new Error('User profile not found.')
  return { uid: cred.user.uid, ...snap.data() }
}

export const logoutUser = () => signOut(auth)

export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

export const changePassword = (newPassword) => updatePassword(auth.currentUser, newPassword)

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid, ...snap.data() } : null
}
