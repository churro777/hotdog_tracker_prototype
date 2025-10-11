/**
 * Hook for managing comments on a post
 * Provides real-time comment updates and operations
 */

import { useState, useEffect, useCallback, useRef } from 'react'

import type { PostComment } from '@types'
import { logError } from '@utils/errorLogger'

import { dataService } from '../services/dataService'

/**
 * Hook return type for post comments operations
 */
interface UsePostCommentsReturn {
  // Data state
  comments: PostComment[]

  // Loading states
  isLoading: boolean
  isAdding: boolean

  // Error states
  error: string | null

  // Operations
  addComment: (
    text: string,
    userId: string,
    userName: string
  ) => Promise<boolean>
  deleteComment: (commentId: string) => Promise<boolean>
  refreshComments: () => Promise<void>

  // Computed state
  commentCount: number
}

/**
 * Custom hook for managing comments on a specific post
 * Provides real-time updates via Firestore listeners
 */
export function usePostComments(postId: string): UsePostCommentsReturn {
  // Cancellation ref to prevent state updates after unmount
  const isCancelledRef = useRef(false)

  // Data state
  const [comments, setComments] = useState<PostComment[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)

  /**
   * Set up real-time listener for comments
   */
  const setupRealtimeListener = useCallback(() => {
    let unsubscribe: (() => void) | null = null

    const setupListener = async () => {
      try {
        if (!isCancelledRef.current) {
          setIsLoading(true)
          setError(null)
        }

        const { collection, onSnapshot, orderBy, query, doc } = await import(
          'firebase/firestore'
        )
        const { db } = await import('@config/firebase')

        const postRef = doc(db, 'contest-posts', postId)
        const commentsRef = collection(postRef, 'comments')
        const q = query(commentsRef, orderBy('timestamp', 'desc'))

        unsubscribe = onSnapshot(
          q,
          snapshot => {
            const loadedComments = snapshot.docs.map(doc => {
              const data = doc.data() as Record<string, unknown>
              const timestamp = data['timestamp'] as
                | { toDate(): Date }
                | undefined
              return {
                id: doc.id,
                postId,
                ...data,
                timestamp: timestamp?.toDate() ?? new Date(),
              } as PostComment
            })

            if (!isCancelledRef.current) {
              setComments(loadedComments)
              setIsLoading(false)
              setError(null)
            }
          },
          error => {
            const errorMessage = 'Failed to load comments'
            if (!isCancelledRef.current) {
              setError(errorMessage)
              setIsLoading(false)
            }
            logError({
              message: errorMessage,
              error: error as Error,
              context: 'post-comments',
              action: 'comments-listener',
            })
          }
        )
      } catch (error) {
        const errorMessage = 'Failed to setup comments listener'
        if (!isCancelledRef.current) {
          setError(errorMessage)
          setIsLoading(false)
        }
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'post-comments',
          action: 'setup-comments-listener',
        })
      }
    }

    void setupListener()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [postId])

  /**
   * Add a new comment
   */
  const addComment = useCallback(
    async (
      text: string,
      userId: string,
      userName: string
    ): Promise<boolean> => {
      // Validation
      if (!text.trim()) {
        setError('Comment cannot be empty')
        return false
      }

      if (text.length > 256) {
        setError('Comment exceeds 256 character limit')
        return false
      }

      setIsAdding(true)
      setError(null)

      try {
        const commentData: Omit<PostComment, 'id' | 'postId'> = {
          userId,
          userName,
          text: text.trim(),
          timestamp: new Date(),
        }

        await dataService.addPostComment(postId, commentData)

        // Real-time listener will update the UI
        return true
      } catch (error) {
        const errorMessage = 'Failed to add comment'
        setError(errorMessage)
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'post-comments',
          action: 'add-comment',
        })
        return false
      } finally {
        if (!isCancelledRef.current) {
          setIsAdding(false)
        }
      }
    },
    [postId]
  )

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      try {
        await dataService.deletePostComment(postId, commentId)

        // Real-time listener will update the UI
        return true
      } catch (error) {
        const errorMessage = `Failed to delete comment ${commentId}`
        setError(errorMessage)
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'post-comments',
          action: 'delete-comment',
        })
        return false
      }
    },
    [postId]
  )

  /**
   * Refresh comments manually (though real-time listener should handle this)
   */
  const refreshComments = useCallback(async (): Promise<void> => {
    try {
      const loadedComments = await dataService.getPostComments(postId)
      if (!isCancelledRef.current) {
        setComments(loadedComments)
      }
    } catch (error) {
      const errorMessage = 'Failed to refresh comments'
      if (!isCancelledRef.current) {
        setError(errorMessage)
      }
      logError({
        message: errorMessage,
        error: error as Error,
        context: 'post-comments',
        action: 'refresh-comments',
      })
    }
  }, [postId])

  // Set up real-time listener
  useEffect(() => {
    isCancelledRef.current = false
    const cleanup = setupRealtimeListener()

    return () => {
      isCancelledRef.current = true
      cleanup()
    }
  }, [setupRealtimeListener])

  return {
    comments,
    isLoading,
    isAdding,
    error,
    addComment,
    deleteComment,
    refreshComments,
    commentCount: comments.length,
  }
}

export default usePostComments
