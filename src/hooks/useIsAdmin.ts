import { useState, useEffect, useRef } from 'react'

import { useAuth } from '@hooks/useAuth'
import { useDataService } from '@hooks/useDataService'

/**
 * Hook to check if the current user has admin privileges
 * @returns Object containing admin status and loading state
 */
export const useIsAdmin = () => {
  const { currentUser } = useAuth()
  const { dataService } = useDataService()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isCancelledRef = useRef(false)

  useEffect(() => {
    isCancelledRef.current = false

    const checkAdminStatus = async () => {
      if (!currentUser) {
        if (!isCancelledRef.current) {
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }

      try {
        if (!isCancelledRef.current) {
          setLoading(true)
          setError(null)
        }

        // Get all users and find the current user's admin status
        const users = await dataService.getUsers()
        const userRecord = users.find(user => user.id === currentUser.uid)

        if (!isCancelledRef.current) {
          setIsAdmin(userRecord?.isAdmin ?? false)
        }
      } catch (err) {
        console.error('Error checking admin status:', err)
        if (!isCancelledRef.current) {
          setError('Failed to check admin status')
          setIsAdmin(false)
        }
      } finally {
        if (!isCancelledRef.current) {
          setLoading(false)
        }
      }
    }

    void checkAdminStatus()

    return () => {
      isCancelledRef.current = true
    }
  }, [currentUser, dataService])

  return { isAdmin, loading, error }
}

export default useIsAdmin
