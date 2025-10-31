/**
 * Modern contest data hook using the service layer
 * This is the new version that will eventually replace useContestData.ts
 * Uses the service layer abstraction for better Firebase integration preparation
 */

import { useCallback } from 'react'

import type { ContestPost, User } from '@types'
import { logError, logValidationError } from '@utils/errorLogger'

import useDataService from './useDataService'

/**
 * User type with contest-specific count calculated from posts
 */
export interface UserWithContestCount extends User {
  /** Total count for the specific contest (calculated from posts) */
  contestCount: number
}

/**
 * Return type for the modern contest data hook
 */
interface UseContestDataV2Return {
  // Filtered data for current contest
  contestPosts: ContestPost[]
  users: UserWithContestCount[]

  // All data (for global operations)
  allPosts: ContestPost[]
  allUsers: User[]

  // Loading and error states
  isLoading: boolean
  error: string | null

  // Pagination state - for contest-specific posts
  hasMorePosts: boolean
  isLoadingMore: boolean

  // Operations
  addPost: (
    count: number,
    description?: string,
    image?: string
  ) => Promise<boolean>
  editPost: (
    postId: string,
    newCount: number,
    newDescription?: string,
    newImage?: string
  ) => Promise<boolean>
  refreshData: () => void
  loadMorePosts: () => Promise<void>

  // User statistics
  getCurrentUserStats: () => {
    totalCount: number
    postCount: number
    avgPerPost: number
    bestSinglePost: number
  } | null
}

/**
 * Modern contest data hook with service layer integration
 * Provides contest-specific data filtering and operations with proper async handling
 */
function useContestDataV2(
  currentUserId: string | undefined,
  contestId?: string
): UseContestDataV2Return {
  const {
    posts: allPosts,
    users: allUsers,
    isLoading,
    error,
    hasMorePosts,
    isLoadingMore,
    addPost: serviceAddPost,
    updatePost: serviceUpdatePost,
    updateUser: serviceUpdateUser,
    refreshData,
    loadMorePosts: serviceLoadMorePosts,
  } = useDataService(contestId)

  // Posts are already filtered by contestId in the useDataService query
  // No need for client-side filtering anymore - the query does it at the database level
  const contestPosts = allPosts

  // Calculate per-contest counts for each user based on their posts in this contest
  const users: UserWithContestCount[] = allUsers.map(user => {
    // Sum up all posts for this user in the current contest
    const userContestPosts = contestPosts.filter(
      post => post.userId === user.id
    )
    const contestCount = userContestPosts.reduce(
      (sum, post) => sum + (post.count ?? 0),
      0
    )

    return {
      ...user,
      contestCount,
    }
  })

  /**
   * Add a new contest post with user total count update
   */
  const addPost = useCallback(
    async (
      count: number,
      description?: string,
      image?: string
    ): Promise<boolean> => {
      try {
        // Check if user is authenticated
        if (!currentUserId) {
          logValidationError(
            'Cannot add post: user not authenticated',
            {},
            'auth-validation'
          )
          return false
        }

        // Validation
        if (count < 0) {
          logValidationError(
            'Post count cannot be negative',
            { count },
            'count-validation'
          )
          return false
        }

        // Find current user
        const currentUser = users.find(u => u.id === currentUserId)
        if (!currentUser) {
          logValidationError(
            `Current user ${currentUserId} not found in users`,
            { currentUserId, availableUsers: users.map(u => u.id) },
            'user-validation'
          )
          return false
        }

        // Create new post data
        const postData: Omit<ContestPost, 'id'> = {
          userId: currentUserId,
          userName: currentUser.displayName,
          count,
          timestamp: new Date(),
          contestId: contestId ?? 'default', // Use provided contestId or default
          ...(image !== undefined && { image }),
          ...(description !== undefined && { description }),
        }

        // Add post via service
        const newPost = await serviceAddPost(postData)
        if (!newPost) return false

        // Update user's total count
        const updatedUser = await serviceUpdateUser(currentUser.id, {
          totalCount: currentUser.totalCount + count,
        })

        return updatedUser !== null
      } catch (error) {
        logError({
          message: 'Error in addPost operation',
          error: error as Error,
          context: 'contest-data-v2',
          action: 'add-post',
        })
        return false
      }
    },
    [currentUserId, users, serviceAddPost, serviceUpdateUser, contestId]
  )

  /**
   * Edit an existing contest post and adjust user totals
   */
  const editPost = useCallback(
    async (
      postId: string,
      newCount: number,
      newDescription?: string,
      newImage?: string
    ): Promise<boolean> => {
      try {
        // Validation
        if (newCount < 0) {
          logValidationError(
            'Post count cannot be negative',
            { newCount },
            'count-validation'
          )
          return false
        }

        // Find the post to edit
        const postToEdit = contestPosts.find(p => p.id === postId)
        if (!postToEdit) {
          logValidationError(
            `Post with ID ${postId} not found`,
            { postId },
            'post-validation'
          )
          return false
        }

        // Find the user who owns this post
        const postUser = users.find(u => u.id === postToEdit.userId)
        if (!postUser) {
          logValidationError(
            `User ${postToEdit.userId} not found in users`,
            { userId: postToEdit.userId },
            'user-validation'
          )
          return false
        }

        const oldCount = postToEdit.count ?? 0
        const countDifference = newCount - oldCount

        // Update the post
        const updateData: Partial<ContestPost> = {
          count: newCount,
          ...(newDescription !== undefined && { description: newDescription }),
          ...(newImage !== undefined && { image: newImage }),
        }
        const updatedPost = await serviceUpdatePost(postId, updateData)
        if (!updatedPost) return false

        // Update user's total count
        const updatedUser = await serviceUpdateUser(postUser.id, {
          totalCount: postUser.totalCount + countDifference,
        })

        return updatedUser !== null
      } catch (error) {
        logError({
          message: 'Error in editPost operation',
          error: error as Error,
          context: 'contest-data-v2',
          action: 'edit-post',
        })
        return false
      }
    },
    [contestPosts, users, serviceUpdatePost, serviceUpdateUser]
  )

  /**
   * Load more posts - wrapper around service method that passes contestId
   */
  const loadMorePosts = useCallback(async () => {
    await serviceLoadMorePosts(contestId)
  }, [serviceLoadMorePosts, contestId])

  /**
   * Get statistics for the current user
   */
  const getCurrentUserStats = useCallback(() => {
    if (!currentUserId) return null

    const currentUserData = users.find(u => u.id === currentUserId)
    if (!currentUserData) return null

    const userPosts = contestPosts.filter(p => p.userId === currentUserId)
    const postCount = userPosts.length
    const totalCount = currentUserData.totalCount
    const avgPerPost = postCount > 0 ? totalCount / postCount : 0
    const bestSinglePost = Math.max(...userPosts.map(p => p.count ?? 0), 0)

    return {
      totalCount,
      postCount,
      avgPerPost: Math.round(avgPerPost * 100) / 100, // Round to 2 decimal places
      bestSinglePost,
    }
  }, [users, contestPosts, currentUserId])

  return {
    // Filtered data
    contestPosts,
    users,

    // All data
    allPosts,
    allUsers,

    // States
    isLoading,
    error,

    // Pagination state
    hasMorePosts,
    isLoadingMore,

    // Operations
    addPost,
    editPost,
    refreshData,
    loadMorePosts,

    // Statistics
    getCurrentUserStats,
  }
}

export default useContestDataV2
