/**
 * Represents the available tab types in the application
 */
export type Tab = 'leaderboard' | 'feed' | 'log' | 'journal'

/**
 * Represents a user in the system
 * @interface User
 */
export interface User {
  /** Unique identifier for the user */
  id: string
  /** Display name of the user */
  name: string
  /** Optional avatar URL for the user */
  avatar?: string
  /** Array of user IDs representing the user's contacts */
  contacts?: string[]
}

/**
 * Represents a post in a contest
 * @interface ContestPost
 */
export interface ContestPost {
  /** Unique identifier for the post */
  id: string
  /** ID of the contest this post belongs to */
  contestId: string
  /** ID of the user who created the post */
  userId: string
  /** Display name of the user who created the post */
  userName: string
  /** Number of items consumed (optional for join/invite posts) */
  count?: number
  /** Optional image URL for the post */
  image?: string
  /** Timestamp when the post was created */
  timestamp: Date
  /** Optional description or comment for the post */
  description?: string
  /** Type of post - entry for consumption tracking, join for joining contest, invite for inviting others */
  type: 'entry' | 'join' | 'invite'
  /** Array of user IDs for invite posts */
  invitedUsers?: string[]
}

/**
 * Represents a user's participation in a specific contest
 * @interface ContestUser
 */
export interface ContestUser {
  /** Unique identifier for the contest user record */
  id: string
  /** ID of the contest */
  contestId: string
  /** ID of the user */
  userId: string
  /** Display name of the user in the contest */
  userName: string
  /** Total count of items consumed by the user in this contest */
  totalCount: number
}
