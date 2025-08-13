import { memo } from 'react'

import './LeaderboardTab.css'
import { UI_TEXT, CSS_CLASSES, ICONS } from '@constants'
import { getThemeColors, COMPONENT_STYLES } from '@constants/theme'
import type { User } from '@types'

interface LeaderboardTabProps {
  contestUsers: User[]
  isDarkMode?: boolean
}

function LeaderboardTab({
  contestUsers,
  isDarkMode = false,
}: LeaderboardTabProps) {
  const themeColors = getThemeColors(isDarkMode)
  const sortedUsers = [...contestUsers].sort(
    (a, b) => b.totalCount - a.totalCount
  )

  // Calculate ranks with special tie handling (no ties for 1st place)
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
        // Different score - new rank is current index + 1
        usersWithRanks.push({ ...user, rank: i + 1 } as User & { rank: number })
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
          const isTopThree = rank <= 3
          const dynamicStyle = isTopThree
            ? {
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.primaryEnd})`,
                color: 'white',
                boxShadow: COMPONENT_STYLES.SHADOWS.LARGE,
                borderRadius: COMPONENT_STYLES.BORDER_RADIUS.LARGE,
                transition: COMPONENT_STYLES.TRANSITIONS.FAST,
              }
            : {
                borderRadius: COMPONENT_STYLES.BORDER_RADIUS.LARGE,
                transition: COMPONENT_STYLES.TRANSITIONS.FAST,
              }

          return (
            <div
              key={user.id}
              className={`leaderboard-item ${rank <= 3 ? 'top-three' : ''}`}
              style={dynamicStyle}
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
