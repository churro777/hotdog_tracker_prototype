import { memo } from 'react'

import './JournalTab.css'
import { FORM_CONFIG, BUTTON_TEXT, ICONS } from '@constants'
import usePostEdit from '@hooks/usePostEdit'
import type { ContestPost } from '@types'

interface JournalTabProps {
  posts: ContestPost[]
  currentUserId: string
  onEditPost: (
    postId: string,
    newCount: number,
    newDescription?: string,
    newImage?: string
  ) => Promise<boolean>
}

function JournalTab({ posts, currentUserId, onEditPost }: JournalTabProps) {
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

  const userPosts = posts.filter(post => post.userId === currentUserId)
  const totalHotDogs = userPosts.reduce(
    (sum, post) => sum + (post.count ?? 0),
    0
  )
  const averagePerPost =
    userPosts.length > 0 ? (totalHotDogs / userPosts.length).toFixed(1) : 0
  const bestDay =
    userPosts.length > 0
      ? Math.max(...userPosts.map(post => post.count ?? 0))
      : 0

  const groupedByDate = userPosts.reduce(
    (groups: Record<string, ContestPost[]>, post) => {
      const date = post.timestamp.toLocaleDateString()
      groups[date] ??= []
      groups[date].push(post)
      return groups
    },
    {}
  )

  return (
    <div className="tab-panel">
      <h2>📔 My Journal</h2>

      <div className="journal-stats">
        <div className="stat-card">
          <div className="stat-number">{totalHotDogs}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userPosts.length}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{averagePerPost}</div>
          <div className="stat-label">Avg per Post</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{bestDay}</div>
          <div className="stat-label">Best Single Post</div>
        </div>
      </div>

      <div className="journal-entries">
        {Object.entries(groupedByDate)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([date, dayPosts]) => {
            const dayTotal = dayPosts.reduce(
              (sum, post) => sum + (post.count ?? 0),
              0
            )
            return (
              <div key={date} className="journal-day">
                <div className="day-header">
                  <h3>{date}</h3>
                  <div className="day-total">📝 {dayTotal} total</div>
                </div>
                <div className="day-posts">
                  {dayPosts
                    .sort(
                      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
                    )
                    .map(post => (
                      <div key={post.id} className="journal-post">
                        {editingPostId === post.id ? (
                          <div className="edit-form">
                            <div className="journal-post-header">
                              <div className="journal-post-time">
                                {post.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
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
                              <div className="journal-post-image">
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
                                  onChange={e =>
                                    setEditDescription(e.target.value)
                                  }
                                  placeholder="How was it? Any comments?"
                                  className="edit-description-input"
                                  rows={2}
                                />
                              </div>
                              <div className="edit-image">
                                <label
                                  htmlFor={`edit-image-upload-${post.id}`}
                                  className="image-upload-label"
                                >
                                  {ICONS.CAMERA}{' '}
                                  {FORM_CONFIG.LABELS.UPLOAD_PICTURE}
                                </label>
                                <input
                                  id={`edit-image-upload-${post.id}`}
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
                            <div className="journal-post-header">
                              <div className="journal-post-time">
                                {post.timestamp.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="journal-post-actions">
                                <div className="journal-post-count">
                                  📝 {post.count ?? 0}
                                </div>
                                <button
                                  onClick={() => startEditing(post)}
                                  className="edit-post-btn"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>

                            {post.image && (
                              <div className="journal-post-image">
                                <img src={post.image} alt="Contest item" />
                              </div>
                            )}

                            {post.description && (
                              <div className="journal-post-description">
                                {post.description}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
      </div>

      {userPosts.length === 0 && (
        <div className="empty-state">
          <p>
            No entries logged yet! Head over to the Log tab to start tracking
            your progress.
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(JournalTab)
