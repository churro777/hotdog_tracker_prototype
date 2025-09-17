import { memo, useEffect, useRef, useCallback } from 'react'

import PostReactions from '@components/PostReactions'
import './FeedTab.css'
import { FORM_CONFIG, BUTTON_TEXT, ICONS } from '@constants'
import usePostEdit from '@hooks/usePostEdit'
import type { ContestPost } from '@types'

/**
 * Props for the FeedTab component
 * @interface FeedTabProps
 */
interface FeedTabProps {
  /** Array of contest posts to display in the feed */
  posts: ContestPost[]
  /** Function to handle editing a post */
  onEditPost: (
    postId: string,
    newCount: number,
    newDescription?: string,
    newImage?: string
  ) => Promise<boolean>
  /** ID of the current user (used to determine edit permissions) */
  currentUserId: string
  /** Whether there are more posts to load */
  hasMorePosts: boolean
  /** Whether currently loading more posts */
  isLoadingMore: boolean
  /** Function to load more posts */
  onLoadMore: () => Promise<void>
  /** Function to toggle upvote on a post */
  onToggleUpvote: (postId: string) => void
  /** Function to toggle flag on a post */
  onToggleFlag: (postId: string) => void
  /** Whether the current user is authenticated */
  isAuthenticated: boolean
}

/**
 * FeedTab component displays a chronological feed of contest posts.
 * Shows different types of posts (entries, joins, invites) with appropriate styling.
 * Allows users to edit their own posts inline.
 *
 * @param {FeedTabProps} props - The component props
 * @returns {JSX.Element} The feed tab content
 */
function FeedTab({
  posts,
  onEditPost,
  currentUserId,
  hasMorePosts,
  isLoadingMore,
  onLoadMore,
  onToggleUpvote,
  onToggleFlag,
  isAuthenticated,
}: FeedTabProps) {
  const {
    editingPostId,
    editCount,
    editDescription,
    editImage,
    isSaving,
    setEditCount,
    setEditDescription,
    handleImageUpload,
    clearImage,
    startEditing,
    saveEdit,
    cancelEdit,
  } = usePostEdit(onEditPost)

  // Ref for the posts container to detect scroll
  const postsContainerRef = useRef<HTMLDivElement>(null)

  /**
   * Handle scroll detection for infinite loading
   */
  const handleScroll = useCallback(() => {
    if (!postsContainerRef.current || !hasMorePosts || isLoadingMore) {
      return
    }

    const container = postsContainerRef.current
    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    // Load more when user is within 100px of bottom
    if (distanceFromBottom < 100) {
      void onLoadMore()
    }
  }, [hasMorePosts, isLoadingMore, onLoadMore])

  /**
   * Set up scroll listener
   */
  useEffect(() => {
    const container = postsContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  /**
   * Renders the content of a post (simplified architecture - all posts are consumption entries)
   * @param {ContestPost} post - The post to render
   * @returns {JSX.Element} The rendered post content
   */
  const renderPostContent = (post: ContestPost) => {
    return (
      <div className="post-content">
        <div className="post-count">
          🌭 <strong>{post.count}</strong> hot dog{post.count !== 1 ? 's' : ''}{' '}
          eaten!
        </div>
        {post.description && (
          <div className="post-description">{post.description}</div>
        )}
        {post.image && (
          <div className="post-image">
            <img src={post.image} alt="Contest item" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="feed-header">
        <h2>📰 Contest Feed</h2>
      </div>

      <div className="posts-section">
        <div className="posts-list" ref={postsContainerRef}>
          {posts.map(post => (
            <div key={post.id} className="post-item">
              {editingPostId === post.id ? (
                <div className="edit-form">
                  <div className="edit-user-name">{post.userName}</div>

                  <div className="edit-count">
                    <label>Items:</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={editCount}
                      onChange={e => setEditCount(e.target.value)}
                      className="edit-count-input"
                    />
                  </div>

                  <div className="edit-description">
                    <label>Description:</label>
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="How was it? Any comments?"
                      className="edit-description-input"
                      rows={3}
                    />
                  </div>

                  {editImage && (
                    <div className="edit-current-image">
                      <img src={editImage} alt="Contest item" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="remove-image"
                      >
                        {BUTTON_TEXT.REMOVE}
                      </button>
                    </div>
                  )}

                  <div className="edit-image-upload">
                    <label
                      htmlFor={`feed-edit-image-upload-${post.id}`}
                      className="image-upload-label"
                    >
                      {ICONS.CAMERA} Upload Picture
                    </label>
                    <input
                      id={`feed-edit-image-upload-${post.id}`}
                      type="file"
                      accept={FORM_CONFIG.INPUT_TYPES.IMAGE_ACCEPT}
                      onChange={handleImageUpload}
                      className="image-upload-input"
                    />
                  </div>

                  <div className="edit-actions">
                    <button
                      onClick={() => {
                        void saveEdit()
                      }}
                      className="save-edit-btn"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : <>💾 Save</>}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="cancel-edit-btn"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="post-header">
                    <div className="post-user-actions">
                      <div className="post-user">{post.userName}</div>
                      {post.userId === currentUserId && (
                        <button
                          onClick={() => startEditing(post)}
                          className="edit-post-btn"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="post-timestamp">
                      {post.timestamp.toLocaleDateString()}{' '}
                      {post.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {renderPostContent(post)}

                  <PostReactions
                    post={post}
                    currentUserId={currentUserId}
                    isAuthenticated={isAuthenticated}
                    onToggleUpvote={onToggleUpvote}
                    onToggleFlag={onToggleFlag}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="loading-more">
            <p>Loading more posts...</p>
          </div>
        )}

        {/* Load more button as fallback */}
        {hasMorePosts && !isLoadingMore && posts.length > 0 && (
          <div className="load-more-section">
            <button onClick={() => void onLoadMore()} className="load-more-btn">
              Load More Posts
            </button>
          </div>
        )}

        {posts.length === 0 && (
          <p className="empty-state">
            No posts yet! Head to the "Log" tab to start sharing your progress.
          </p>
        )}
      </div>
    </div>
  )
}

export default memo(FeedTab)
