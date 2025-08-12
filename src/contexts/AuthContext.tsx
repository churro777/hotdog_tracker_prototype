import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import type { User } from 'firebase/auth'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

import { auth, db } from '@config/firebase'

import { AuthContext, type AuthContextType } from './AuthContext.types'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signup = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user

    await updateProfile(user, { displayName })

    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      displayName,
      totalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await ensureUserDocument(result.user)
  }

  const loginWithTwitter = async () => {
    const provider = new TwitterAuthProvider()
    const result = await signInWithPopup(auth, provider)
    await ensureUserDocument(result.user)
  }

  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com')
    const result = await signInWithPopup(auth, provider)
    await ensureUserDocument(result.user)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const ensureUserDocument = async (user: User) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        displayName:
          user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous',
        totalCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        void ensureUserDocument(user)
      }
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithTwitter,
    loginWithApple,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
