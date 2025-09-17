import { useState, useEffect, useCallback } from 'react'

import type { ContestPost } from '@types'

import './FlaggedPostsTab.css'

interface FlaggedPostsTabProps {
  /** Function to get flagged posts */
  onGetFlaggedPosts: (threshold?: number) => Promise<ContestPost[]>
  /** Function to clear flags from a post */
  onClearFlags: (postId: string) => Promise<boolean>
  /** Function to delete a post */
  onDeletePost: (postId: string) => Promise<boolean>
}

/**
 * FlaggedPostsTab component for admin moderation of flagged posts.
 * Shows posts that have been flagged by users as suspicious.
 */
function FlaggedPostsTab({
  onGetFlaggedPosts,
  onClearFlags,
  onDeletePost,
}: FlaggedPostsTabProps) {
  const [flaggedPosts, setFlaggedPosts] = useState<ContestPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flagThreshold, setFlagThreshold] = useState(3)
  const [processingPosts, setProcessingPosts] = useState<Set<string>>(new Set())

  /**
   * Load flagged posts based on threshold
   */
  const loadFlaggedPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const posts = await onGetFlaggedPosts(flagThreshold)
      setFlaggedPosts(posts)
    } catch (err) {
      setError('Failed to load flagged posts')
      console.error('Error loading flagged posts:', err)
    } finally {
      setLoading(false)
    }
  }, [onGetFlaggedPosts, flagThreshold])

  /**
   * Handle clearing flags from a post
   */
  const handleClearFlags = async (postId: string) => {
    if (!confirm('Are you sure you want to clear all flags from this post?')) {
      return
    }

    setProcessingPosts(prev => new Set(prev).add(postId))

    try {
      const success = await onClearFlags(postId)
      if (success) {
        // Remove from flagged posts list
        setFlaggedPosts(prev => prev.filter(post => post.id !== postId))
      } else {
        setError('Failed to clear flags')
      }
    } catch (err) {
      setError('Failed to clear flags')
      console.error('Error clearing flags:', err)
    } finally {
      setProcessingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  /**
   * Handle deleting a post
   */
  const handleDeletePost = async (postId: string) => {
    if (
      !confirm(
        'Are you sure you want to DELETE this post? This action cannot be undone.'
      )
    ) {
      return
    }

    setProcessingPosts(prev => new Set(prev).add(postId))

    try {
      const success = await onDeletePost(postId)
      if (success) {
        // Remove from flagged posts list
        setFlaggedPosts(prev => prev.filter(post => post.id !== postId))
      } else {
        setError('Failed to delete post')
      }
    } catch (err) {
      setError('Failed to delete post')
      console.error('Error deleting post:', err)
    } finally {
      setProcessingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  /**
   * Handle threshold change
   */
  const handleThresholdChange = (newThreshold: number) => {
    setFlagThreshold(newThreshold)
  }

  // Load flagged posts on mount and when threshold changes
  useEffect(() => {
    void loadFlaggedPosts()
  }, [loadFlaggedPosts])

  return (
    <div className="flagged-posts-tab">
      <div className="flagged-posts-header">
        <h3>🐟 Flagged Posts Review</h3>
        <p>Review posts that have been flagged by users as suspicious</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="flagged-posts-controls">
        <div className="threshold-control">
          <label htmlFor="flag-threshold">Flag Threshold:</label>
          <select
            id="flag-threshold"
            value={flagThreshold}
            onChange={e => handleThresholdChange(Number(e.target.value))}
          >
            <option value={1}>1+ flags</option>
            <option value={2}>2+ flags</option>
            <option value={3}>3+ flags</option>
            <option value={5}>5+ flags</option>
          </select>
        </div>

        <button onClick={() => void loadFlaggedPosts()} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading flagged posts...</div>
      ) : flaggedPosts.length === 0 ? (
        <div className="no-flagged-posts">
          <p>🎉 No posts with {flagThreshold}+ flags found!</p>
          <p>All posts appear to be legitimate.</p>
        </div>
      ) : (
        <div className="flagged-posts-list">
          {flaggedPosts.map(post => {
            const isProcessing = processingPosts.has(post.id)
            const flagCount = post.fishyFlags?.length ?? 0

            return (
              <div key={post.id} className="flagged-post-card">
                <div className="flagged-post-header">
                  <div className="post-info">
                    <span className="user-name">{post.userName}</span>
                    <span className="post-date">
                      {post.timestamp.toLocaleDateString()}{' '}
                      {post.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flag-info">
                    <span className="flag-count">🐟 {flagCount} flags</span>
                  </div>
                </div>

                <div className="flagged-post-content">
                  <div className="post-count">
                    🌭 {post.count} hot dog{post.count !== 1 ? 's' : ''}
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

                <div className="flagged-post-actions">
                  <button
                    onClick={() => void handleClearFlags(post.id)}
                    className="clear-flags-btn"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : '✅ Clear Flags'}
                  </button>
                  <button
                    onClick={() => void handleDeletePost(post.id)}
                    className="delete-post-btn"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : '🗑️ Delete Post'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FlaggedPostsTab
