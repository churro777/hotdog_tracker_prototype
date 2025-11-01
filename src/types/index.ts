/**
 * Represents the available tab types in the application
 */
export type Tab = 'leaderboard' | 'feed' | 'log' | 'journal' | 'constdogtution'

/**
 * Predefined emoji reactions available for posts
 */
export const REACTION_EMOJIS = {
  THUMBS_UP: '👍',
  HEART: '❤️',
  HEART_EYES: '😍',
  PARTY: '🎉',
  FIRE: '🔥',
  HUNDRED: '💯',
  LAUGH: '😂',
  THINKING: '🤔',
} as const

/**
 * Type for valid reaction emoji values
 */
export type ReactionEmoji =
  (typeof REACTION_EMOJIS)[keyof typeof REACTION_EMOJIS]

/**
 * Represents a user in the system (simplified architecture - includes contest data)
 * @interface User
 */
export interface User {
  /** Unique identifier for the user (Firebase Auth UID) */
  id: string
  /** User's email from Firebase Auth */
  email: string
  /** User-chosen display name */
  displayName: string
  /** Optional profile picture URL */
  avatar?: string
  /** Account creation timestamp */
  createdAt: Date
  /** Last app usage */
  lastActive: Date
  /** Running total of hot dogs consumed */
  totalCount: number
  /** Optional user bio */
  bio?: string
  /** Personal best single day */
  bestDay?: {
    count: number
    date: Date
  }
  /** Array of achievement IDs */
  achievements?: string[]
  /** User settings */
  preferences?: {
    notifications: boolean
    theme: 'light' | 'dark'
  }
  /** Admin privileges for contest management */
  isAdmin?: boolean
  /** Soft delete flag - if true, user is hidden from contests and leaderboards */
  isHidden?: boolean
  /** Timestamp when the user was hidden */
  hiddenAt?: Date
  /** ID of the admin user who hid this user */
  hiddenBy?: string
}

/**
 * Represents a contest with start/end dates and management info
 * @interface Contest
 */
export interface Contest {
  /** Unique identifier for the contest */
  id: string
  /** Contest name/title */
  name: string
  /** Contest description */
  description?: string
  /** Contest start date and time */
  startDate: Date
  /** Contest end date and time */
  endDate: Date
  /** End of review period date and time - when users can no longer view/review but cannot post */
  endOfReviewDate?: Date
  /** Contest status */
  status: 'upcoming' | 'active' | 'completed'
  /** Whether this is the default contest to display */
  isDefault?: boolean
  /** Contest creation timestamp */
  createdAt: Date
  /** ID of user who created the contest */
  createdBy: string
}

/**
 * Represents a post in a contest (multi-contest architecture)
 * @interface ContestPost
 */
export interface ContestPost {
  /** Unique identifier for the post */
  id: string
  /** ID of the contest this post belongs to */
  contestId: string
  /** ID of the user who created the post (Firebase Auth UID) */
  userId: string
  /** Display name of the user who created the post */
  userName: string
  /** Number of hot dogs consumed (always required) */
  count: number
  /** Optional image URL for the post */
  image?: string
  /** Timestamp when the post was created */
  timestamp: Date
  /** Optional description or comment for the post */
  description?: string
  /** Object mapping emoji reactions to arrays of user IDs who selected them */
  reactions?: Record<string, string[]>
  /** Array of user IDs who flagged this post as suspicious */
  fishyFlags?: string[]
  /** @deprecated Legacy upvotes field - use reactions instead */
  upvotes?: string[]
  /** Optional location data */
  location?: {
    lat: number
    lng: number
    name?: string
  }
  /** Soft delete flag - if true, post is hidden from normal queries */
  isDeleted?: boolean
  /** Timestamp when the post was soft deleted */
  deletedAt?: Date
  /** ID of the admin user who deleted this post */
  deletedBy?: string
}

/**
 * Represents a comment on a contest post
 * @interface PostComment
 */
export interface PostComment {
  /** Unique identifier for the comment */
  id: string
  /** ID of the post this comment belongs to */
  postId: string
  /** ID of the user who created the comment (Firebase Auth UID) */
  userId: string
  /** Display name of the user who created the comment */
  userName: string
  /** Comment text content (max 256 characters) */
  text: string
  /** Timestamp when the comment was created */
  timestamp: Date
}

/**
 * @deprecated ContestUser is deprecated in simplified architecture
 * Use User interface instead - contest data is now part of the User
 * This interface remains for migration compatibility only
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
