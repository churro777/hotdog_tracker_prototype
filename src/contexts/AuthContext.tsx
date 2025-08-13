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
  GoogleAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore'

import { auth, db } from '@config/firebase'
import { CONTEST_IDS } from '@constants'

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

    // Create contest user record
    await ensureContestUser(user.uid, displayName)
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

  const ensureUserDocument = useCallback(async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)
    const displayName = user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous'
    
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
      const updates: Record<string, unknown> = {}
      
      // Check for missing required fields and add them
      if (!userData?.['displayName']) {
        updates['displayName'] = displayName
      }
      if (!userData?.['email']) {
        updates['email'] = user.email
      }
      if (!userData?.['totalCount'] && userData?.['totalCount'] !== 0) {
        updates['totalCount'] = 0
      }
      if (!userData?.['createdAt']) {
        updates['createdAt'] = new Date()
      }
      
      // Always update updatedAt timestamp
      updates['updatedAt'] = new Date()
      
      // Apply updates if any fields are missing or need updating
      if (Object.keys(updates).length > 0) {
        await updateDoc(userDocRef, updates as Record<string, unknown>)
        console.log(`Updated user document for ${displayName} with missing fields:`, Object.keys(updates))
      }
    }

    // Ensure contest user document exists and is up to date
    await ensureContestUser(user.uid, displayName)
  }, [])

  const ensureContestUser = async (userId: string, displayName: string) => {
    try {
      // Check if user already exists in the contest
      const contestUsersRef = collection(db, 'contest-users')
      const q = query(
        contestUsersRef, 
        where('contestId', '==', CONTEST_IDS.DEFAULT),
        where('userId', '==', userId)
      )
      const existingUsers = await getDocs(q)
      
      if (existingUsers.empty) {
        // Create new contest user record
        await addDoc(contestUsersRef, {
          contestId: CONTEST_IDS.DEFAULT,
          userId: userId,
          userName: displayName,
          totalCount: 0,
        })
        
        console.log(`Created contest user for ${displayName} in contest ${CONTEST_IDS.DEFAULT}`)
      } else {
        // Verify and update existing contest user with any missing fields
        const existingUser = existingUsers.docs[0]
        if (existingUser) {
          const userData = existingUser.data()
          const updates: Record<string, unknown> = {}
          
          // Check for missing required fields and add them
          if (!userData?.['contestId']) {
            updates['contestId'] = CONTEST_IDS.DEFAULT
          }
          if (!userData?.['userId']) {
            updates['userId'] = userId
          }
          if (!userData?.['userName']) {
            updates['userName'] = displayName
          }
          if (!userData?.['totalCount'] && userData?.['totalCount'] !== 0) {
            updates['totalCount'] = 0
          }
          
          // Apply updates if any fields are missing
          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'contest-users', existingUser.id), updates as Record<string, unknown>)
            console.log(`Updated contest user for ${displayName} with missing fields:`, Object.keys(updates))
          } else {
            console.log(`Contest user already exists and is up to date for ${displayName}`)
          }
        }
      }
    } catch (error) {
      console.error('Error ensuring contest user:', error)
      // Don't throw error to avoid breaking authentication flow
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
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
