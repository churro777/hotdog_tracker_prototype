import type { ReactNode } from 'react'
import { useEffect, useState, useCallback } from 'react'

import type { User } from 'firebase/auth'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
} from 'firebase/auth'
import type { UpdateData } from 'firebase/firestore'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

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

    // Create user document
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      displayName,
      totalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // User is automatically in the contest (simplified architecture)
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

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const ensureUserDocument = useCallback(async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)
    const displayName =
      user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous'

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email,
        displayName,
        totalCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`Created user document for ${displayName}`)
    } else {
      // Verify and update existing user document with any missing fields
      const userData = userDoc.data()
      const updates: UpdateData<{
        displayName?: string
        email?: string | null
        totalCount?: number
        createdAt?: Date
        updatedAt?: Date
      }> = {}

      // Check for missing required fields and add them
      if (!userData?.['displayName']) {
        updates.displayName = displayName
      }
      if (!userData?.['email']) {
        updates.email = user.email
      }
      if (!userData?.['totalCount'] && userData?.['totalCount'] !== 0) {
        updates.totalCount = 0
      }
      if (!userData?.['createdAt']) {
        updates.createdAt = new Date()
      }

      // Always update updatedAt timestamp
      updates.updatedAt = new Date()

      // Apply updates if any fields are missing or need updating
      if (Object.keys(updates).length > 0) {
        await updateDoc(userDocRef, updates)
        console.log(
          `Updated user document for ${displayName} with missing fields:`,
          Object.keys(updates)
        )
      }
    }

    // All user data is now in the users collection (simplified architecture)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        void ensureUserDocument(user)
      }
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [ensureUserDocument])

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithTwitter,
    loginWithApple,
    logout,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
