import './LeaderboardTab.css'
import type { ContestUser } from '../../types'
import { UI_TEXT, CSS_CLASSES, ICONS } from '../../constants'
import { getThemeColors, COMPONENT_STYLES } from '../../constants/theme'

interface LeaderboardTabProps {
  contestUsers: ContestUser[]
  isDarkMode?: boolean
}

function LeaderboardTab({ contestUsers, isDarkMode = false }: LeaderboardTabProps) {
  const themeColors = getThemeColors(isDarkMode)
  const sortedUsers = [...contestUsers].sort((a, b) => b.totalCount - a.totalCount)

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'  
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  return (
    <div className={CSS_CLASSES.TAB_PANEL}>
      <h2>{UI_TEXT.TABS.LEADERBOARD}</h2>
      <div className="leaderboard">
        {sortedUsers.map((user, index) => {
          const rank = index + 1
          const isTopThree = rank <= 3
          const dynamicStyle = isTopThree ? {
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.primaryEnd})`,
            color: 'white',
            boxShadow: COMPONENT_STYLES.SHADOWS.LARGE,
            borderRadius: COMPONENT_STYLES.BORDER_RADIUS.LARGE,
            transition: COMPONENT_STYLES.TRANSITIONS.FAST
          } : {
            borderRadius: COMPONENT_STYLES.BORDER_RADIUS.LARGE,
            transition: COMPONENT_STYLES.TRANSITIONS.FAST
          }
          
          return (
            <div 
              key={user.id} 
              className={`leaderboard-item ${rank <= 3 ? 'top-three' : ''}`}
              style={dynamicStyle}
            >
              <div className="rank">
                {getRankEmoji(rank)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.userName}</div>
                <div className="user-score">{user.totalCount} hot dogs</div>
              </div>
              <div className="hot-dog-count">
                {ICONS.HOT_DOG} {user.totalCount}
              </div>
            </div>
          )
        })}
      </div>
      {sortedUsers.length === 0 && (
        <p className={CSS_CLASSES.EMPTY_STATE}>{UI_TEXT.EMPTY_STATES.NO_CONTESTANTS}</p>
      )}
    </div>
  )
}

export default LeaderboardTab