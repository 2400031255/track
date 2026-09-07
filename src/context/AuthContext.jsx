import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserProfile } from '../firebase/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid)
        setUser(profile)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
