import { memo } from 'react'

import type { ContestPost } from '@types'

import './ReactionSummary.css'

interface ReactionSummaryProps {
  /** The post to display reactions for */
  post: ContestPost
  /** ID of the current user */
  currentUserId: string | null
  /** Maximum number of reactions to display before showing "..." */
  maxVisible?: number
}

/**
 * ReactionSummary component displays a summary of all reactions on a post.
 * Shows emoji reactions with counts, highlighting user's own reaction.
 */
function ReactionSummary({
  post,
  currentUserId,
  maxVisible = 3,
}: ReactionSummaryProps) {
  // Get reactions from new format, with fallback to legacy upvotes
  const reactions = post.reactions ?? {}

  // Handle legacy upvotes by converting to new format
  const legacyUpvotes = post.upvotes ?? []
  if (legacyUpvotes.length > 0 && !reactions['👍']) {
    reactions['👍'] = legacyUpvotes
  }

  // Convert to sorted array of [emoji, userIds] pairs
  const reactionEntries = Object.entries(reactions)
    .filter(([, userIds]) => userIds.length > 0)
    .sort(([, aUserIds], [, bUserIds]) => bUserIds.length - aUserIds.length) // Sort by count descending

  // Find user's reaction
  const userReaction = currentUserId
    ? reactionEntries.find(([, userIds]) => userIds.includes(currentUserId))
    : null

  if (reactionEntries.length === 0) {
    return null // No reactions to display
  }

  const visibleReactions = reactionEntries.slice(0, maxVisible)
  const hasMore = reactionEntries.length > maxVisible
  const totalReactions = reactionEntries.reduce(
    (sum, [, userIds]) => sum + userIds.length,
    0
  )

  return (
    <div className="reaction-summary">
      <div className="reaction-items">
        {visibleReactions.map(([emoji, userIds]) => {
          const hasUserReacted = currentUserId
            ? userIds.includes(currentUserId)
            : false

          return (
            <div
              key={emoji}
              className={`reaction-item ${hasUserReacted ? 'user-reacted' : ''}`}
              title={getReactionTooltip(emoji, userIds, currentUserId)}
            >
              <span className="reaction-emoji">{emoji}</span>
              <span className="reaction-count">{userIds.length}</span>
            </div>
          )
        })}

        {hasMore && (
          <div
            className="reaction-more"
            title={`${totalReactions} total reactions`}
          >
            <span className="reaction-dots">...</span>
            <span className="reaction-total">
              +{reactionEntries.length - maxVisible}
            </span>
          </div>
        )}
      </div>

      {userReaction && (
        <div className="user-reaction-indicator">
          <span className="user-reaction-text">You reacted with</span>
          <span className="user-reaction-emoji">{userReaction[0]}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Generate tooltip text for a reaction showing who reacted
 */
function getReactionTooltip(
  emoji: string,
  userIds: string[],
  currentUserId: string | null
): string {
  const count = userIds.length
  const hasCurrentUser = currentUserId ? userIds.includes(currentUserId) : false

  if (count === 1 && hasCurrentUser) {
    return `You reacted with ${emoji}`
  }

  if (count === 1) {
    return `1 person reacted with ${emoji}`
  }

  if (hasCurrentUser) {
    return `You and ${count - 1} other${count > 2 ? 's' : ''} reacted with ${emoji}`
  }

  return `${count} people reacted with ${emoji}`
}

export default memo(ReactionSummary)
