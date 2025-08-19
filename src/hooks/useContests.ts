import { useState, useEffect, useCallback } from 'react'

import { useDataService } from '@hooks/useDataService'
import type { Contest } from '@types'

/**
 * Hook for managing contest data and determining active contests
 */
export const useContests = () => {
  const { dataService } = useDataService()
  const [contests, setContests] = useState<Contest[]>([])
  const [activeContest, setActiveContest] = useState<Contest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load contests on mount
  const loadContests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const contestsData = await dataService.getContests()
      setContests(contestsData)
    } catch (err) {
      setError('Failed to load contests')
      console.error('Error loading contests:', err)
    } finally {
      setLoading(false)
    }
  }, [dataService])

  useEffect(() => {
    void loadContests()
  }, [loadContests])

  // Determine active contest when contests change
  useEffect(() => {
    if (contests.length > 0) {
      const active = getActiveContest(contests)
      setActiveContest(active)
    }
  }, [contests])

  const getActiveContest = (contestList: Contest[]): Contest | null => {
    const now = new Date()

    // First, try to find an active contest within date range
    const activeInRange = contestList.find(
      contest =>
        contest.status === 'active' &&
        contest.startDate <= now &&
        contest.endDate >= now
    )

    if (activeInRange) {
      return activeInRange
    }

    // If no active contest found, return the default one
    const defaultContest = contestList.find(contest => contest.isDefault)
    if (defaultContest) {
      return defaultContest
    }

    // If no default, return the first active or upcoming contest
    const fallback = contestList.find(
      contest => contest.status === 'active' || contest.status === 'upcoming'
    )

    return fallback ?? null
  }

  const createContest = async (
    contestData: Omit<Contest, 'id'>
  ): Promise<Contest> => {
    try {
      const newContest = await dataService.addContest(contestData)
      await loadContests() // Reload to get updated list
      return newContest
    } catch (err) {
      console.error('Error creating contest:', err)
      throw err
    }
  }

  const updateContest = async (
    id: string,
    updates: Partial<Contest>
  ): Promise<Contest> => {
    try {
      const updatedContest = await dataService.updateContest(id, updates)
      await loadContests() // Reload to get updated list
      return updatedContest
    } catch (err) {
      console.error('Error updating contest:', err)
      throw err
    }
  }

  const deleteContest = async (id: string): Promise<void> => {
    try {
      await dataService.deleteContest(id)
      await loadContests() // Reload to get updated list
    } catch (err) {
      console.error('Error deleting contest:', err)
      throw err
    }
  }

  const refreshContests = () => {
    return loadContests()
  }

  return {
    contests,
    activeContest,
    loading,
    error,
    createContest,
    updateContest,
    deleteContest,
    refreshContests,
    getActiveContest: () => getActiveContest(contests),
  }
}

export default useContests
