export type Tab = 'leaderboard' | 'feed' | 'log' | 'journal'

export type User = {
  id: string
  name: string
  avatar?: string
  contacts?: string[] // array of user IDs
}

export type ContestPost = {
  id: string
  contestId: string
  userId: string
  userName: string
  count?: number
  image?: string
  timestamp: Date
  description?: string
  type: 'entry' | 'join' | 'invite'
  invitedUsers?: string[] // for invite posts
}

export type ContestUser = {
  id: string
  contestId: string
  userId: string
  userName: string
  totalCount: number
}