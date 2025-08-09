/**
 * Modern contest data hook using the service layer
 * This is the new version that will eventually replace useContestData.ts
 * Uses the service layer abstraction for better Firebase integration preparation
 */

import { useMemo, useCallback } from 'react'

import { POST_TYPES } from '@constants'
import type { ContestPost, ContestUser } from '@types'
import { logError, logValidationError } from '@utils/errorLogger'

import useDataService from './useDataService'

/**
 * Return type for the modern contest data hook
 */
interface UseContestDataV2Return {
  // Filtered data for current contest
  contestPosts: ContestPost[]
  contestUsers: ContestUser[]

  // All data (for global operations)
  allPosts: ContestPost[]
  allUsers: ContestUser[]

  // Loading and error states
  isLoading: boolean
  error: string | null

  // Operations
  addPost: (
    count: number,
    description?: string,
    image?: string
  ) => Promise<boolean>
  editPost: (
    postId: string,
    newCount: number,
    newDescription?: string
  ) => Promise<boolean>
  refreshData: () => Promise<void>

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
  contestId: string,
  currentUserId: string
): UseContestDataV2Return {
  const {
    posts: allPosts,
    users: allUsers,
    isLoading,
    error,
    addPost: serviceAddPost,
    updatePost: serviceUpdatePost,
    updateUser: serviceUpdateUser,
    refreshData,
  } = useDataService()

  // Filter data for current contest
  const contestPosts = useMemo(
    () => allPosts.filter(post => post.contestId === contestId),
    [allPosts, contestId]
  )

  const contestUsers = useMemo(
    () => allUsers.filter(user => user.contestId === contestId),
    [allUsers, contestId]
  )

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
        const currentContestUser = contestUsers.find(
          u => u.userId === currentUserId
        )
        if (!currentContestUser) {
          logValidationError(
            `Current user ${currentUserId} not found in contest users`,
            { currentUserId, availableUsers: contestUsers.map(u => u.userId) },
            'user-validation'
          )
          return false
        }

        // Create new post data
        const postData: Omit<ContestPost, 'id'> = {
          contestId,
          userId: currentUserId,
          userName: currentContestUser.userName,
          count,
          timestamp: new Date(),
          type: POST_TYPES.ENTRY,
          ...(image !== undefined && { image }),
          ...(description !== undefined && { description }),
        }

        // Add post via service
        const newPost = await serviceAddPost(postData)
        if (!newPost) return false

        // Update user's total count
        const updatedUser = await serviceUpdateUser(currentContestUser.id, {
          totalCount: currentContestUser.totalCount + count,
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
    [contestId, currentUserId, contestUsers, serviceAddPost, serviceUpdateUser]
  )

  /**
   * Edit an existing contest post and adjust user totals
   */
  const editPost = useCallback(
    async (
      postId: string,
      newCount: number,
      newDescription?: string
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
        const postUser = contestUsers.find(u => u.userId === postToEdit.userId)
        if (!postUser) {
          logValidationError(
            `User ${postToEdit.userId} not found in contest users`,
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
    [contestPosts, contestUsers, serviceUpdatePost, serviceUpdateUser]
  )

  /**
   * Get statistics for the current user
   */
  const getCurrentUserStats = useCallback(() => {
    const currentUser = contestUsers.find(u => u.userId === currentUserId)
    if (!currentUser) return null

    const userPosts = contestPosts.filter(
      p => p.userId === currentUserId && p.type === POST_TYPES.ENTRY
    )
    const postCount = userPosts.length
    const totalCount = currentUser.totalCount
    const avgPerPost = postCount > 0 ? totalCount / postCount : 0
    const bestSinglePost = Math.max(...userPosts.map(p => p.count ?? 0), 0)

    return {
      totalCount,
      postCount,
      avgPerPost: Math.round(avgPerPost * 100) / 100, // Round to 2 decimal places
      bestSinglePost,
    }
  }, [contestUsers, contestPosts, currentUserId])

  return {
    // Filtered data
    contestPosts,
    contestUsers,

    // All data
    allPosts,
    allUsers,

    // States
    isLoading,
    error,

    // Operations
    addPost,
    editPost,
    refreshData,

    // Statistics
    getCurrentUserStats,
  }
}

export default useContestDataV2
