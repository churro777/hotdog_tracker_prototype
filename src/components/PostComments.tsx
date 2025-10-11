import { memo, useState } from 'react'

import usePostComments from '@hooks/usePostComments'
import type { ContestPost } from '@types'

import './PostComments.css'

interface PostCommentsProps {
  /** The post to display comments for */
  post: ContestPost
  /** ID of the current user */
  currentUserId: string | null
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Whether the current user is an admin */
  isAdmin?: boolean
}

/**
 * PostComments component displays and manages comments on a post.
 * Shows 3 initial comments with "view more" expansion.
 */
function PostComments({
  post,
  currentUserId,
  isAuthenticated,
  isAdmin = false,
}: PostCommentsProps) {
  const {
    comments,
    isLoading,
    isAdding,
    error,
    addComment,
    deleteComment,
    commentCount,
  } = usePostComments(post.id)

  const [commentText, setCommentText] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Get current user's display name from the post or other available data
  const currentUserName = currentUserId
    ? post.userId === currentUserId
      ? post.userName
      : 'You'
    : ''

  // Show only 3 comments initially unless expanded
  const displayedComments = showAll ? comments : comments.slice(0, 3)
  const hasMoreComments = comments.length > 3

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !currentUserId) {
      setLocalError('You must be signed in to comment')
      return
    }

    if (!commentText.trim()) {
      setLocalError('Comment cannot be empty')
      return
    }

    if (commentText.length > 256) {
      setLocalError('Comment exceeds 256 character limit')
      return
    }

    setLocalError(null)

    const success = await addComment(
      commentText,
      currentUserId,
      currentUserName
    )

    if (success) {
      setCommentText('')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    await deleteComment(commentId)
  }

  const canDeleteComment = (commentUserId: string) => {
    return isAuthenticated && (currentUserId === commentUserId || isAdmin)
  }

  const characterCount = commentText.length
  const isOverLimit = characterCount > 256

  return (
    <div className="post-comments">
      {/* Comments header */}
      {commentCount > 0 && (
        <div className="comments-header">
          <span className="comments-count">
            💬 {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
        </div>
      )}

      {/* Comments list */}
      {isLoading && comments.length === 0 ? (
        <div className="comments-loading">Loading comments...</div>
      ) : (
        <>
          {displayedComments.length > 0 && (
            <div className="comments-list">
              {displayedComments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-user">{comment.userName}</span>
                    <div className="comment-meta">
                      <span className="comment-timestamp">
                        {comment.timestamp.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {comment.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {canDeleteComment(comment.userId) && (
                        <button
                          onClick={() => void handleDeleteComment(comment.id)}
                          className="comment-delete-btn"
                          title="Delete comment"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* View more button */}
          {hasMoreComments && !showAll && (
            <button onClick={() => setShowAll(true)} className="view-more-btn">
              View {comments.length - 3} more{' '}
              {comments.length - 3 === 1 ? 'comment' : 'comments'}
            </button>
          )}

          {/* View less button */}
          {showAll && hasMoreComments && (
            <button onClick={() => setShowAll(false)} className="view-more-btn">
              View less
            </button>
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading && comments.length === 0 && (
        <div className="comments-empty">No comments yet. Be the first!</div>
      )}

      {/* Add comment form */}
      {isAuthenticated ? (
        <form
          onSubmit={e => void handleSubmitComment(e)}
          className="comment-form"
        >
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className={`comment-input ${isOverLimit ? 'over-limit' : ''}`}
            rows={2}
            disabled={isAdding}
          />
          <div className="comment-form-footer">
            <span
              className={`character-count ${isOverLimit ? 'over-limit' : ''}`}
            >
              {characterCount}/256
            </span>
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={isAdding || !commentText.trim() || isOverLimit}
            >
              {isAdding ? 'Posting...' : 'Post'}
            </button>
          </div>
          {(error ?? localError) && (
            <div className="comment-error">{error ?? localError}</div>
          )}
        </form>
      ) : (
        <div className="comment-auth-prompt">Sign in to leave a comment</div>
      )}
    </div>
  )
}

export default memo(PostComments)
