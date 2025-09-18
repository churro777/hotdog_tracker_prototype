import { memo, useState } from 'react'

import EmotePicker from '@components/EmotePicker'
import ReactionSummary from '@components/ReactionSummary'
import type { ContestPost, ReactionEmoji } from '@types'

import './PostReactions.css'

interface PostReactionsProps {
  /** The post to display reactions for */
  post: ContestPost
  /** ID of the current user */
  currentUserId: string | null
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Handler for toggling emoji reaction */
  onToggleReaction: (postId: string, emoji: ReactionEmoji) => void
  /** Handler for toggling flag */
  onToggleFlag: (postId: string) => void
  /** Whether reactions are currently being updated */
  isUpdating?: boolean
}

/**
 * PostReactions component displays and handles user reactions to posts.
 * Shows emoji picker, reaction summary, and flag options.
 */
function PostReactions({
  post,
  currentUserId,
  isAuthenticated,
  onToggleReaction,
  onToggleFlag,
  isUpdating = false,
}: PostReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const reactions = post.reactions ?? {}
  const fishyFlags = post.fishyFlags ?? []

  // Handle legacy upvotes
  const legacyUpvotes = post.upvotes ?? []
  if (legacyUpvotes.length > 0 && !reactions['👍']) {
    reactions['👍'] = legacyUpvotes
  }

  // Find user's current reactions
  const userReactions = currentUserId
    ? Object.entries(reactions)
        .filter(([, userIds]) => userIds.includes(currentUserId))
        .map(([emoji]) => emoji)
    : []

  const hasUserFlagged = currentUserId
    ? fishyFlags.includes(currentUserId)
    : false
  const isOwnPost = currentUserId === post.userId

  const handleReactionClick = () => {
    if (!isAuthenticated || isOwnPost || isUpdating) return
    setShowPicker(true)
  }

  const handleEmojiSelect = (emoji: ReactionEmoji) => {
    if (!isAuthenticated || isOwnPost || isUpdating) return
    onToggleReaction(post.id, emoji)
  }

  const handleFlagClick = () => {
    if (!isAuthenticated || isOwnPost || isUpdating) return
    onToggleFlag(post.id)
  }

  return (
    <div className="post-reactions">
      <div className="reactions-main">
        {/* Reaction Summary */}
        <ReactionSummary
          post={post}
          currentUserId={currentUserId}
          maxVisible={3}
        />

        {/* Reaction Controls */}
        <div className="reaction-controls">
          {/* React button */}
          <button
            onClick={handleReactionClick}
            className={`reaction-btn react-btn ${userReactions.length > 0 ? 'active' : ''} ${
              !isAuthenticated || isOwnPost ? 'disabled' : ''
            }`}
            disabled={!isAuthenticated || isOwnPost || isUpdating}
            title={
              !isAuthenticated
                ? 'Sign in to react'
                : isOwnPost
                  ? "You can't react to your own post"
                  : userReactions.length > 0
                    ? `Your reactions: ${userReactions.join('')} - click to change`
                    : 'React with emojis'
            }
          >
            {userReactions.length > 0 ? (
              <>
                <div className="user-emojis">
                  {userReactions.slice(0, 3).map(emoji => (
                    <span key={emoji} className="user-emoji">
                      {emoji}
                    </span>
                  ))}
                  {userReactions.length > 3 && (
                    <span className="more-count">
                      +{userReactions.length - 3}
                    </span>
                  )}
                </div>
                <span className="react-text">Change</span>
              </>
            ) : (
              <>
                <span className="react-emoji">😊</span>
                <span className="react-text">React</span>
              </>
            )}
          </button>

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

      {/* Emoji Picker */}
      <EmotePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleEmojiSelect}
        selectedEmojis={userReactions}
        disabled={isUpdating}
      />
    </div>
  )
}

export default memo(PostReactions)
