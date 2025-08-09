/**
 * Hook for interacting with the data service layer
 * Provides React-friendly interface for data operations with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react'

import type { ContestPost, ContestUser } from '@types'
import { logError, logUserError } from '@utils/errorLogger'

import { dataService } from '../services/dataService'

/**
 * Hook return type for data service operations
 */
interface UseDataServiceReturn {
  // Data state
  posts: ContestPost[]
  users: ContestUser[]

  // Loading states
  isLoading: boolean
  isPostsLoading: boolean
  isUsersLoading: boolean

  // Error states
  error: string | null
  postsError: string | null
  usersError: string | null

  // Operations
  refreshData: () => Promise<void>
  addPost: (postData: Omit<ContestPost, 'id'>) => Promise<ContestPost | null>
  updatePost: (
    id: string,
    updates: Partial<ContestPost>
  ) => Promise<ContestPost | null>
  deletePost: (id: string) => Promise<boolean>
  updateUser: (
    id: string,
    updates: Partial<ContestUser>
  ) => Promise<ContestUser | null>
  addUser: (userData: Omit<ContestUser, 'id'>) => Promise<ContestUser | null>
}

/**
 * Custom hook for managing data service operations
 * Provides loading states, error handling, and optimistic updates
 */
export function useDataService(): UseDataServiceReturn {
  // Data state
  const [posts, setPosts] = useState<ContestPost[]>([])
  const [users, setUsers] = useState<ContestUser[]>([])

  // Loading states
  const [isPostsLoading, setIsPostsLoading] = useState(true)
  const [isUsersLoading, setIsUsersLoading] = useState(true)

  // Error states
  const [postsError, setPostsError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Derived states
  const isLoading = isPostsLoading || isUsersLoading
  const error = postsError ?? usersError

  /**
   * Load posts from data service
   */
  const loadPosts = useCallback(async () => {
    try {
      setIsPostsLoading(true)
      setPostsError(null)
      const loadedPosts = await dataService.getPosts()
      setPosts(loadedPosts)
    } catch (error) {
      const errorMessage = 'Failed to load posts'
      setPostsError(errorMessage)
      logError({
        message: errorMessage,
        error: error as Error,
        context: 'data-service',
        action: 'load-posts',
      })
    } finally {
      setIsPostsLoading(false)
    }
  }, [])

  /**
   * Load users from data service
   */
  const loadUsers = useCallback(async () => {
    try {
      setIsUsersLoading(true)
      setUsersError(null)
      const loadedUsers = await dataService.getUsers()
      setUsers(loadedUsers)
    } catch (error) {
      const errorMessage = 'Failed to load users'
      setUsersError(errorMessage)
      logError({
        message: errorMessage,
        error: error as Error,
        context: 'data-service',
        action: 'load-users',
      })
    } finally {
      setIsUsersLoading(false)
    }
  }, [])

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([loadPosts(), loadUsers()])
  }, [loadPosts, loadUsers])

  /**
   * Add a new post
   */
  const addPost = useCallback(
    async (postData: Omit<ContestPost, 'id'>): Promise<ContestPost | null> => {
      try {
        const newPost = await dataService.addPost(postData)

        // Optimistic update
        setPosts(currentPosts => [newPost, ...currentPosts])

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

        // Optimistic update
        setPosts(currentPosts =>
          currentPosts.map(post => (post.id === id ? updatedPost : post))
        )

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
  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      await dataService.deletePost(id)

      // Optimistic update
      setPosts(currentPosts => currentPosts.filter(post => post.id !== id))

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
  }, [])

  /**
   * Update an existing user
   */
  const updateUser = useCallback(
    async (
      id: string,
      updates: Partial<ContestUser>
    ): Promise<ContestUser | null> => {
      try {
        const updatedUser = await dataService.updateUser(id, updates)

        // Optimistic update
        setUsers(currentUsers =>
          currentUsers.map(user => (user.id === id ? updatedUser : user))
        )

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
    async (userData: Omit<ContestUser, 'id'>): Promise<ContestUser | null> => {
      try {
        const newUser = await dataService.addUser(userData)

        // Optimistic update
        setUsers(currentUsers => [...currentUsers, newUser])

        return newUser
      } catch (error) {
        const errorMessage = 'Failed to add user'
        logUserError(errorMessage, error as Error, userData.userId, 'add-user')
        return null
      }
    },
    []
  )

  // Load initial data
  useEffect(() => {
    void refreshData()
  }, [refreshData])

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

    // Operations
    refreshData,
    addPost,
    updatePost,
    deletePost,
    updateUser,
    addUser,
  }
}

export default useDataService
