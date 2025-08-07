import './FeedTab.css'
import type { ContestPost } from '../../types'
import usePostEdit from '../../hooks/usePostEdit'

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
    newDescription?: string
  ) => void
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
    setEditCount,
    setEditDescription,
    startEditing,
    saveEdit,
    cancelEdit,
  } = usePostEdit(onEditPost)

  /**
   * Renders the content of a post based on its type.
   * Different rendering for entry, join, and invite posts.
   *
   * @param {ContestPost} post - The post to render
   * @returns {JSX.Element} The rendered post content
   */
  const renderPostContent = (post: ContestPost) => {
    if (post.type === 'join') {
      return (
        <div className="post-content join-post">
          <div className="join-notification">
            🎉 <strong>{post.userName}</strong> joined the contest!
          </div>
          {post.description && (
            <div className="post-description">{post.description}</div>
          )}
        </div>
      )
    }

    if (post.type === 'invite') {
      return (
        <div className="post-content invite-post">
          <div className="invite-notification">
            📧 <strong>{post.userName}</strong> invited new participants to the
            contest
          </div>
          {post.description && (
            <div className="post-description">{post.description}</div>
          )}
        </div>
      )
    }

    // Default entry post
    return (
      <div className="post-content">
        <div className="post-count">
          🌭 <strong>{post.count}</strong> hot dog{post.count !== 1 ? 's' : ''}{' '}
          eaten!
        </div>
        {post.description && (
          <div className="post-description">{post.description}</div>
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
            <div key={post.id} className={`post-item ${post.type}`}>
              {editingPostId === post.id && post.type === 'entry' ? (
                <div className="edit-form">
                  <div className="post-header">
                    <div className="post-user">{post.userName}</div>
                    <div className="edit-controls">
                      <button onClick={saveEdit} className="save-edit-btn">
                        💾
                      </button>
                      <button onClick={cancelEdit} className="cancel-edit-btn">
                        ❌
                      </button>
                    </div>
                  </div>

                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Contest item" />
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
                      {post.userId === currentUserId &&
                        post.type === 'entry' && (
                          <button
                            onClick={() => startEditing(post)}
                            className="edit-post-btn"
                          >
                            ✏️
                          </button>
                        )}
                    </div>
                  </div>

                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Contest item" />
                    </div>
                  )}

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

export default FeedTab
