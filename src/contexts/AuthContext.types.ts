import { createContext } from 'react'

import type { User } from 'firebase/auth'

export interface AuthContextType {
  currentUser: User | null
  loading: boolean
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithTwitter: () => Promise<void>
  loginWithApple: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateDisplayName: (newDisplayName: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
