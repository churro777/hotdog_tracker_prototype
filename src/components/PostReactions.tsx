import { memo } from 'react'

import type { ContestPost } from '@types'

import './PostReactions.css'

interface PostReactionsProps {
  /** The post to display reactions for */
  post: ContestPost
  /** ID of the current user */
  currentUserId: string | null
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Handler for toggling upvote */
  onToggleUpvote: (postId: string) => void
  /** Handler for toggling flag */
  onToggleFlag: (postId: string) => void
  /** Whether reactions are currently being updated */
  isUpdating?: boolean
}

/**
 * PostReactions component displays and handles user reactions to posts.
 * Shows thumbs up, hot dog reaction, and flag options with appropriate styling.
 */
function PostReactions({
  post,
  currentUserId,
  isAuthenticated,
  onToggleUpvote,
  onToggleFlag,
  isUpdating = false,
}: PostReactionsProps) {
  const upvotes = post.upvotes ?? []
  const fishyFlags = post.fishyFlags ?? []

  const hasUserUpvoted = currentUserId ? upvotes.includes(currentUserId) : false
  const hasUserFlagged = currentUserId
    ? fishyFlags.includes(currentUserId)
    : false
  const isOwnPost = currentUserId === post.userId

  const handleUpvoteClick = () => {
    if (!isAuthenticated || isOwnPost || isUpdating) return
    onToggleUpvote(post.id)
  }

  const handleFlagClick = () => {
    if (!isAuthenticated || isOwnPost || isUpdating) return
    onToggleFlag(post.id)
  }

  return (
    <div className="post-reactions">
      <div className="reactions-left">
        {/* Thumbs up reaction */}
        <button
          onClick={handleUpvoteClick}
          className={`reaction-btn upvote-btn ${hasUserUpvoted ? 'active' : ''} ${
            !isAuthenticated || isOwnPost ? 'disabled' : ''
          }`}
          disabled={!isAuthenticated || isOwnPost || isUpdating}
          title={
            !isAuthenticated
              ? 'Sign in to react'
              : isOwnPost
                ? "You can't react to your own post"
                : hasUserUpvoted
                  ? 'Remove thumbs up'
                  : 'Give thumbs up'
          }
        >
          👍{' '}
          {upvotes.length > 0 && (
            <span className="count">{upvotes.length}</span>
          )}
        </button>
      </div>

      <div className="reactions-right">
        {/* Flag button */}
        <button
          onClick={handleFlagClick}
          className={`reaction-btn flag-btn ${hasUserFlagged ? 'active' : ''} ${
            !isAuthenticated || isOwnPost ? 'disabled' : ''
          }`}
          disabled={!isAuthenticated || isOwnPost || isUpdating}
          title={
            !isAuthenticated
              ? 'Sign in to flag'
              : isOwnPost
                ? "You can't flag your own post"
                : hasUserFlagged
                  ? 'Remove flag'
                  : 'Flag as suspicious'
          }
        >
          🐟{' '}
          {fishyFlags.length > 0 && (
            <span className="count">{fishyFlags.length}</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default memo(PostReactions)
