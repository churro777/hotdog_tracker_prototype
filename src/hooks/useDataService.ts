/**
 * Hook for interacting with the data service layer
 * Provides React-friendly interface for data operations with loading states and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'

import { useAuth } from '@hooks/useAuth'
import type { ContestPost, User } from '@types'
import { logError, logUserError } from '@utils/errorLogger'

import { dataService } from '../services/dataService'

/**
 * Hook return type for data service operations
 */
interface UseDataServiceReturn {
  // Data state
  posts: ContestPost[]
  users: User[]

  // Loading states
  isLoading: boolean
  isPostsLoading: boolean
  isUsersLoading: boolean

  // Error states
  error: string | null
  postsError: string | null
  usersError: string | null

  // Pagination state
  hasMorePosts: boolean
  isLoadingMore: boolean

  // Operations
  refreshData: () => void
  loadMorePosts: (contestId?: string) => Promise<void>
  addPost: (postData: Omit<ContestPost, 'id'>) => Promise<ContestPost | null>
  updatePost: (
    id: string,
    updates: Partial<ContestPost>
  ) => Promise<ContestPost | null>
  deletePost: (id: string) => Promise<boolean>
  getDeletedPosts: () => Promise<ContestPost[]>
  restorePost: (id: string) => Promise<boolean>
  syncContestScores: () => Promise<{ updated: number; errors: string[] }>
  updateUser: (id: string, updates: Partial<User>) => Promise<User | null>
  addUser: (userData: Omit<User, 'id'>) => Promise<User | null>

  // Post reactions
  togglePostReaction: (
    postId: string,
    userId: string,
    emoji: string
  ) => Promise<boolean>
  togglePostFlag: (postId: string, userId: string) => Promise<boolean>
  /** @deprecated Use togglePostReaction instead */
  togglePostUpvote: (postId: string, userId: string) => Promise<boolean>

  // Admin operations
  clearPostFlags: (postId: string) => Promise<boolean>
  getFlaggedPosts: (threshold?: number) => Promise<ContestPost[]>

  // Direct service access
  dataService: typeof dataService
}

/**
 * Custom hook for managing data service operations
 * Provides loading states, error handling, and optimistic updates
 */
export function useDataService(): UseDataServiceReturn {
  // Cancellation ref to prevent state updates after unmount
  const isCancelledRef = useRef(false)

  // Get current user for audit trail
  const { currentUser } = useAuth()
  const userId: string | undefined = currentUser?.uid

  // Data state
  const [posts, setPosts] = useState<ContestPost[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Loading states
  const [isPostsLoading, setIsPostsLoading] = useState(true)
  const [isUsersLoading, setIsUsersLoading] = useState(true)

  // Error states
  const [postsError, setPostsError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Pagination state
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [lastPostDoc, setLastPostDoc] = useState<unknown>(null)

  // Derived states
  const isLoading = isPostsLoading || isUsersLoading
  const error = postsError ?? usersError

  /**
   * Set up real-time listeners for posts and users
   */
  const setupRealtimeListeners = useCallback(() => {
    let postsUnsubscribe: (() => void) | null = null
    let usersUnsubscribe: (() => void) | null = null

    const setupPostsListener = async () => {
      try {
        if (!isCancelledRef.current) {
          setIsPostsLoading(true)
          setPostsError(null)
        }

        const { collection, onSnapshot, orderBy, query, limit } = await import(
          'firebase/firestore'
        )
        const { db } = await import('@config/firebase')

        const postsRef = collection(db, 'contest-posts')
        const q = query(
          postsRef,
          orderBy('timestamp', 'desc'),
          limit(20) // Get more to account for filtering
        )

        postsUnsubscribe = onSnapshot(
          q,
          snapshot => {
            const loadedPosts = snapshot.docs
              .map(doc => {
                const data = doc.data() as Record<string, unknown>
                const timestamp = data['timestamp'] as
                  | { toDate(): Date }
                  | undefined
                return {
                  id: doc.id,
                  ...data,
                  timestamp: timestamp?.toDate() ?? new Date(),
                }
              })
              .filter(
                post => !(post as unknown as { isDeleted?: boolean }).isDeleted
              )
              .slice(0, 10) as ContestPost[] // Limit to 10 after filtering

            if (!isCancelledRef.current) {
              setPosts(loadedPosts)
              setIsPostsLoading(false)
              setPostsError(null)

              // Update pagination state
              const hasMore = snapshot.docs.length === 10
              setHasMorePosts(hasMore)
              setLastPostDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
            }
          },
          error => {
            const errorMessage = 'Failed to load posts'
            if (!isCancelledRef.current) {
              setPostsError(errorMessage)
              setIsPostsLoading(false)
            }
            logError({
              message: errorMessage,
              error: error as Error,
              context: 'data-service',
              action: 'posts-listener',
            })
          }
        )
      } catch (error) {
        const errorMessage = 'Failed to setup posts listener'
        if (!isCancelledRef.current) {
          setPostsError(errorMessage)
          setIsPostsLoading(false)
        }
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'setup-posts-listener',
        })
      }
    }

    const setupUsersListener = async () => {
      try {
        if (!isCancelledRef.current) {
          setIsUsersLoading(true)
          setUsersError(null)
        }

        const { collection, onSnapshot, orderBy, query } = await import(
          'firebase/firestore'
        )
        const { db } = await import('@config/firebase')

        const usersRef = collection(db, 'users')
        const q = query(usersRef, orderBy('totalCount', 'desc'))

        usersUnsubscribe = onSnapshot(
          q,
          snapshot => {
            const loadedUsers = snapshot.docs.map(doc => {
              const data = doc.data() as Record<string, unknown>
              const createdAt = data['createdAt'] as
                | { toDate(): Date }
                | undefined
              const lastActive = data['lastActive'] as
                | { toDate(): Date }
                | undefined

              return {
                id: doc.id,
                ...data,
                createdAt: createdAt?.toDate() ?? new Date(),
                lastActive: lastActive?.toDate() ?? new Date(),
              }
            }) as User[]

            if (!isCancelledRef.current) {
              setUsers(loadedUsers)
              setIsUsersLoading(false)
              setUsersError(null)
            }
          },
          error => {
            const errorMessage = 'Failed to load users'
            if (!isCancelledRef.current) {
              setUsersError(errorMessage)
              setIsUsersLoading(false)
            }
            logError({
              message: errorMessage,
              error: error as Error,
              context: 'data-service',
              action: 'users-listener',
            })
          }
        )
      } catch (error) {
        const errorMessage = 'Failed to setup users listener'
        // Only set state if component is still mounted
        if (!isCancelledRef.current) {
          setUsersError(errorMessage)
          setIsUsersLoading(false)
        }
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'setup-users-listener',
        })
      }
    }

    // Start both listeners
    void setupPostsListener()
    void setupUsersListener()

    // Return cleanup function
    return () => {
      if (postsUnsubscribe) {
        postsUnsubscribe()
      }
      if (usersUnsubscribe) {
        usersUnsubscribe()
      }
    }
  }, [])

  /**
   * Refresh all data (now just re-establishes listeners)
   */
  const refreshData = useCallback(() => {
    // With real-time listeners, we don't need to manually refresh
    // The listeners will automatically update when data changes
    console.log('Real-time listeners active - data refreshes automatically')
  }, [])

  /**
   * Load more posts for pagination
   */
  const loadMorePosts = useCallback(async () => {
    if (!hasMorePosts || isLoadingMore || !lastPostDoc) {
      return
    }

    setIsLoadingMore(true)

    try {
      const { collection, getDocs, orderBy, query, limit, startAfter } =
        await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const postsRef = collection(db, 'contest-posts')
      const q = query(
        postsRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastPostDoc),
        limit(20) // Get more to account for filtering
      )

      const snapshot = await getDocs(q)

      const newPosts = snapshot.docs
        .map(doc => {
          const data = doc.data() as Record<string, unknown>
          const timestamp = data['timestamp'] as { toDate(): Date } | undefined
          return {
            id: doc.id,
            ...data,
            timestamp: timestamp?.toDate() ?? new Date(),
          }
        })
        .filter(post => !(post as unknown as { isDeleted?: boolean }).isDeleted)
        .slice(0, 10) as ContestPost[] // Limit to 10 after filtering

      if (!isCancelledRef.current) {
        setPosts(prevPosts => [...prevPosts, ...newPosts])
        const hasMore = snapshot.docs.length === 10
        setHasMorePosts(hasMore)
        setLastPostDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
      }
    } catch (error) {
      const errorMessage = 'Failed to load more posts'
      if (!isCancelledRef.current) {
        setPostsError(errorMessage)
      }
      logError({
        message: errorMessage,
        error: error as Error,
        context: 'data-service',
        action: 'load-more-posts',
      })
    } finally {
      if (!isCancelledRef.current) {
        setIsLoadingMore(false)
      }
    }
  }, [hasMorePosts, isLoadingMore, lastPostDoc])

  /**
   * Add a new post
   */
  const addPost = useCallback(
    async (postData: Omit<ContestPost, 'id'>): Promise<ContestPost | null> => {
      try {
        const newPost = await dataService.addPost(postData)

        // No optimistic update needed - real-time listener will handle it

        return newPost
      } catch (error) {
        const errorMessage = 'Failed to add post'
        logUserError(errorMessage, error as Error, postData.userId, 'add-post')
        return null
      }
    },
    []
  )

  /**
   * Update an existing post
   */
  const updatePost = useCallback(
    async (
      id: string,
      updates: Partial<ContestPost>
    ): Promise<ContestPost | null> => {
      try {
        const updatedPost = await dataService.updatePost(id, updates)

        // No optimistic update needed - real-time listener will handle it

        return updatedPost
      } catch (error) {
        const errorMessage = `Failed to update post ${id}`
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'update-post',
        })
        return null
      }
    },
    []
  )

  /**
   * Delete a post
   */
  const deletePost = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await dataService.deletePost(id, userId)

        // No optimistic update needed - real-time listener will handle it

        return true
      } catch (error) {
        const errorMessage = `Failed to delete post ${id}`
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'delete-post',
        })
        return false
      }
    },
    [userId]
  )

  /**
   * Get deleted posts for admin review
   */
  const getDeletedPosts = useCallback(async (): Promise<ContestPost[]> => {
    try {
      return await dataService.getDeletedPosts()
    } catch (error) {
      const errorMessage = 'Failed to fetch deleted posts'
      logError({
        message: errorMessage,
        error: error as Error,
        context: 'data-service',
        action: 'get-deleted-posts',
      })
      return []
    }
  }, [])

  /**
   * Restore a soft-deleted post
   */
  const restorePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      await dataService.restorePost(id)
      return true
    } catch (error) {
      const errorMessage = `Failed to restore post ${id}`
      logError({
        message: errorMessage,
        error: error as Error,
        context: 'data-service',
        action: 'restore-post',
      })
      return false
    }
  }, [])

  /**
   * Sync contest scores by recalculating from posts
   */
  const syncContestScores = useCallback(async (): Promise<{
    updated: number
    errors: string[]
  }> => {
    try {
      return await dataService.syncContestScores()
    } catch (error) {
      const errorMessage = 'Failed to sync contest scores'
      logError({
        message: errorMessage,
        error: error as Error,
        context: 'data-service',
        action: 'sync-contest-scores',
      })
      return { updated: 0, errors: [errorMessage] }
    }
  }, [])

  /**
   * Update an existing user
   */
  const updateUser = useCallback(
    async (id: string, updates: Partial<User>): Promise<User | null> => {
      try {
        const updatedUser = await dataService.updateUser(id, updates)

        // No optimistic update needed - real-time listener will handle it

        return updatedUser
      } catch (error) {
        const errorMessage = `Failed to update user ${id}`
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'update-user',
        })
        return null
      }
    },
    []
  )

  /**
   * Add a new user
   */
  const addUser = useCallback(
    async (userData: Omit<User, 'id'>): Promise<User | null> => {
      try {
        const newUser = await dataService.addUser(userData)

        // No optimistic update needed - real-time listener will handle it

        return newUser
      } catch (error) {
        const errorMessage = 'Failed to add user'
        logUserError(errorMessage, error as Error, userData.email, 'add-user')
        return null
      }
    },
    []
  )

  /**
   * Toggle emoji reaction on a post
   */
  const togglePostReaction = useCallback(
    async (postId: string, userId: string, emoji: string): Promise<boolean> => {
      try {
        await dataService.togglePostReaction(postId, userId, emoji)
        // Real-time listener will handle UI update
        return true
      } catch (error) {
        const errorMessage = `Failed to toggle reaction on post ${postId}`
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'toggle-reaction',
        })
        return false
      }
    },
    []
  )

  /**
   * @deprecated Use togglePostReaction instead
   * Toggle upvote on a post
   */
  const togglePostUpvote = useCallback(
    async (postId: string, userId: string): Promise<boolean> => {
      // Forward to new reaction system with thumbs up emoji
      return togglePostReaction(postId, userId, '👍')
    },
    [togglePostReaction]
  )

  /**
   * Toggle flag on a post
   */
  const togglePostFlag = useCallback(
    async (postId: string, userId: string): Promise<boolean> => {
      try {
        await dataService.togglePostFlag(postId, userId)
        // Real-time listener will handle UI update
        return true
      } catch (error) {
        const errorMessage = `Failed to toggle flag on post ${postId}`
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'toggle-flag',
        })
        return false
      }
    },
    []
  )

  /**
   * Clear all flags from a post (admin operation)
   */
  const clearPostFlags = useCallback(
    async (postId: string): Promise<boolean> => {
      try {
        await dataService.clearPostFlags(postId)
        // Real-time listener will handle UI update
        return true
      } catch (error) {
        const errorMessage = `Failed to clear flags on post ${postId}`
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'clear-flags',
        })
        return false
      }
    },
    []
  )

  /**
   * Get flagged posts (admin operation)
   */
  const getFlaggedPosts = useCallback(
    async (threshold = 3): Promise<ContestPost[]> => {
      try {
        return await dataService.getFlaggedPosts(threshold)
      } catch (error) {
        const errorMessage = 'Failed to fetch flagged posts'
        logError({
          message: errorMessage,
          error: error as Error,
          context: 'data-service',
          action: 'get-flagged-posts',
        })
        return []
      }
    },
    []
  )

  // Set up real-time listeners
  useEffect(() => {
    isCancelledRef.current = false
    const cleanup = setupRealtimeListeners()

    // Cleanup listeners on unmount
    return () => {
      isCancelledRef.current = true
      cleanup()
    }
  }, [setupRealtimeListeners])

  return {
    // Data state
    posts,
    users,

    // Loading states
    isLoading,
    isPostsLoading,
    isUsersLoading,

    // Error states
    error,
    postsError,
    usersError,

    // Pagination state
    hasMorePosts,
    isLoadingMore,

    // Operations
    refreshData,
    loadMorePosts,
    addPost,
    updatePost,
    deletePost,
    updateUser,
    addUser,

    // Post reactions
    togglePostReaction,
    togglePostFlag,
    togglePostUpvote,

    // Admin operations
    clearPostFlags,
    getFlaggedPosts,
    getDeletedPosts,
    restorePost,
    syncContestScores,

    // Direct service access
    dataService,
  }
}

export default useDataService
