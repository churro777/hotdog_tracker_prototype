import './LeaderboardTab.css'
import type { ContestUser } from '../../types'

interface LeaderboardTabProps {
  contestUsers: ContestUser[]
}

function LeaderboardTab({ contestUsers }: LeaderboardTabProps) {
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
    <div className="tab-panel">
      <h2>🏆 Leaderboard</h2>
      <div className="leaderboard">
        {sortedUsers.map((user, index) => {
          const rank = index + 1
          return (
            <div key={user.id} className={`leaderboard-item ${rank <= 3 ? 'top-three' : ''}`}>
              <div className="rank">
                {getRankEmoji(rank)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.userName}</div>
                <div className="user-score">{user.totalCount} hot dogs</div>
              </div>
              <div className="hot-dog-count">
                🌭 {user.totalCount}
              </div>
            </div>
          )
        })}
      </div>
      {sortedUsers.length === 0 && (
        <p className="empty-state">No contestants yet! Start logging to get on the leaderboard.</p>
      )}
    </div>
  )
}

export default LeaderboardTab