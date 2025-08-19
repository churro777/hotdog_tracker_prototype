import { useMemo } from 'react'

import type { User } from '@types'

export interface LeaderInfo {
  /** The leading user, or null if no users */
  leader: User | null
  /** The leader's total count */
  leadingCount: number
  /** Whether there's a tie for first place */
  isTied: boolean
  /** Number of users tied for first (if applicable) */
  tiedCount: number
}

/**
 * Hook to determine the current leader in a contest
 * Finds the user with the highest totalCount
 */
export const useContestLeader = (users: User[]): LeaderInfo => {
  return useMemo(() => {
    if (!users || users.length === 0) {
      return {
        leader: null,
        leadingCount: 0,
        isTied: false,
        tiedCount: 0,
      }
    }

    // Sort users by totalCount descending
    const sortedUsers = [...users].sort((a, b) => b.totalCount - a.totalCount)

    const leader = sortedUsers[0] ?? null
    if (!leader) {
      return {
        leader: null,
        leadingCount: 0,
        isTied: false,
        tiedCount: 0,
      }
    }

    const leadingCount = leader.totalCount

    // Check for ties at the top
    const usersWithLeadingCount = sortedUsers.filter(
      user => user.totalCount === leadingCount
    )

    const isTied = usersWithLeadingCount.length > 1
    const tiedCount = usersWithLeadingCount.length

    return {
      leader,
      leadingCount,
      isTied,
      tiedCount,
    }
  }, [users])
}

export default useContestLeader
