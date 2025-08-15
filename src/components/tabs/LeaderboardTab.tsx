import { memo } from 'react'

import './LeaderboardTab.css'
import { UI_TEXT, CSS_CLASSES, ICONS } from '@constants'
import type { User } from '@types'

interface LeaderboardTabProps {
  users: User[]
}

function LeaderboardTab({ users }: LeaderboardTabProps) {
  const sortedUsers = [...users].sort((a, b) => b.totalCount - a.totalCount)

  // Calculate ranks with proper tie handling
  const usersWithRanks: (User & { rank: number })[] = []

  for (let i = 0; i < sortedUsers.length; i++) {
    const user = sortedUsers[i]
    if (!user) continue

    if (i === 0) {
      // First user: check if tied with others
      const tiedCount = sortedUsers.filter(
        u => u?.totalCount === user.totalCount
      ).length
      if (tiedCount === 1) {
        // Only one person with this score - gets rank 1
        usersWithRanks.push({ ...user, rank: 1 } as User & { rank: number })
      } else {
        // Multiple people tied - they get rank 2 (no ties for 1st place)
        usersWithRanks.push({ ...user, rank: 2 } as User & { rank: number })
      }
    } else {
      // Check if same score as previous user
      if (sortedUsers[i - 1]?.totalCount === user.totalCount) {
        // Same score as previous user - same rank
        const previousUser = usersWithRanks[i - 1]
        if (previousUser) {
          usersWithRanks.push({ ...user, rank: previousUser.rank } as User & {
            rank: number
          })
        }
      } else {
        // Different score - use "1224" ranking system
        // Tied users get the rank of their last position
        const lastOccurrenceIndex =
          sortedUsers
            .map((u, idx) => ({ user: u, index: idx }))
            .filter(({ user: u }) => u && u.totalCount === user.totalCount)
            .pop()?.index ?? i
        usersWithRanks.push({
          ...user,
          rank: lastOccurrenceIndex + 1,
        } as User & { rank: number })
      }
    }
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  return (
    <div className={CSS_CLASSES.TAB_PANEL}>
      <h2>{UI_TEXT.TABS.LEADERBOARD}</h2>
      <div className="leaderboard">
        {usersWithRanks.map((user, _index) => {
          const { rank } = user
          const getRankClass = (rank: number) => {
            switch (rank) {
              case 1:
                return 'first-place'
              case 2:
                return 'second-place'
              case 3:
                return 'third-place'
              default:
                return ''
            }
          }

          return (
            <div
              key={user.id}
              className={`leaderboard-item ${getRankClass(rank)} ${rank <= 3 ? 'top-three' : ''}`}
            >
              <div className="rank">{getRankEmoji(rank)}</div>
              <div className="user-info">
                <div className="user-name">{user.displayName}</div>
                <div className="user-score">{user.totalCount} hot dogs</div>
              </div>
              <div className="hot-dog-count">
                {ICONS.HOT_DOG} {user.totalCount}
              </div>
            </div>
          )
        })}
      </div>
      {usersWithRanks.length === 0 && (
        <p className={CSS_CLASSES.EMPTY_STATE}>
          {UI_TEXT.EMPTY_STATES.NO_CONTESTANTS}
        </p>
      )}
    </div>
  )
}

export default memo(LeaderboardTab)
