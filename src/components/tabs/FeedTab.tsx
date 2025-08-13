import { memo } from 'react'

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
}

/**
 * FeedTab component displays a chronological feed of contest posts.
 * Shows different types of posts (entries, joins, invites) with appropriate styling.
 * Allows users to edit their own posts inline.
 *
 * @param {FeedTabProps} props - The component props
 * @returns {JSX.Element} The feed tab content
 */
function FeedTab({ posts, onEditPost, currentUserId }: FeedTabProps) {
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
        <div className="posts-list">
          {posts.map(post => (
            <div key={post.id} className="post-item">
              {editingPostId === post.id ? (
                <div className="edit-form">
                  <div className="post-header">
                    <div className="post-user">{post.userName}</div>
                    <div className="edit-controls">
                      <button
                        onClick={() => {
                          void saveEdit()
                        }}
                        className="save-edit-btn"
                        disabled={isSaving}
                      >
                        {isSaving ? '⏳' : '💾'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="cancel-edit-btn"
                        disabled={isSaving}
                      >
                        ❌
                      </button>
                    </div>
                  </div>

                  {editImage && (
                    <div className="post-image">
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

                  <div className="edit-inputs">
                    <div className="edit-count">
                      <label>Items: </label>
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
                      <label>Description: </label>
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        placeholder="How was it? Any comments?"
                        className="edit-description-input"
                        rows={2}
                      />
                    </div>
                    <div className="edit-image">
                      <label
                        htmlFor={`feed-edit-image-upload-${post.id}`}
                        className="image-upload-label"
                      >
                        {ICONS.CAMERA} {FORM_CONFIG.LABELS.UPLOAD_PICTURE}
                      </label>
                      <input
                        id={`feed-edit-image-upload-${post.id}`}
                        type="file"
                        accept={FORM_CONFIG.INPUT_TYPES.IMAGE_ACCEPT}
                        onChange={handleImageUpload}
                        className="image-upload-input"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="post-header">
                    <div className="post-user">{post.userName}</div>
                    <div className="post-timestamp-actions">
                      <div className="post-timestamp">
                        {post.timestamp.toLocaleDateString()}{' '}
                        {post.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {post.userId === currentUserId && (
                        <button
                          onClick={() => startEditing(post)}
                          className="edit-post-btn"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>

                  {renderPostContent(post)}
                </>
              )}
            </div>
          ))}
        </div>

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
