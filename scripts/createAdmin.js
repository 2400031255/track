/**
 * Run this ONCE to create the admin account.
 * 
 * Steps:
 *   npm install firebase   (already done)
 *   node scripts/createAdmin.js
 */

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBwIeq5R7X9lX__cLwWIEGIdroC4UNyMEQ',
  authDomain: 'dhanatrack.firebaseapp.com',
  projectId: 'dhanatrack',
  storageBucket: 'dhanatrack.firebasestorage.app',
  messagingSenderId: '930404863668',
  appId: '1:930404863668:web:df173e303d7d92da9ad1e1',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createAdmin() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, 'nikhil@dhanatrack.app', 'nikhil2006')
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name: 'Nikhil',
      email: 'nikhil@dhanatrack.app',
      username: 'nikhil',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    console.log('✅ Admin account created successfully!')
    console.log('   Username : nikhil')
    console.log('   Password : nikhil2006')
    console.log('   Role     : admin')
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin already exists. You can log in with:')
      console.log('   Username : nikhil')
      console.log('   Password : nikhil2006')
    } else {
      console.error('❌ Error:', err.message)
    }
  }
  process.exit(0)
}

createAdmin()
