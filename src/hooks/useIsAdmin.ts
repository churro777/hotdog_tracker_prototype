import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get all users and find the current user's admin status
        const users = await dataService.getUsers()
        const userRecord = users.find(user => user.id === currentUser.uid)

        setIsAdmin(userRecord?.isAdmin ?? false)
      } catch (err) {
        console.error('Error checking admin status:', err)
        setError('Failed to check admin status')
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    void checkAdminStatus()
  }, [currentUser, dataService])

  return { isAdmin, loading, error }
}

export default useIsAdmin
