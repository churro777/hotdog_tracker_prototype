/**
 * Tests for the data service layer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

import type { ContestPost, ContestUser } from '@types'
import { POST_TYPES, CONTEST_IDS, USER_IDS } from '@constants'

import { LocalStorageDataService } from './dataService'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('LocalStorageDataService', () => {
  let service: LocalStorageDataService
  
  const mockPost: ContestPost = {
    id: 'test-post-1',
    contestId: CONTEST_IDS.DEFAULT,
    userId: USER_IDS.CURRENT_USER,
    userName: 'Test User',
    count: 5,
    timestamp: new Date('2023-01-01'),
    description: 'Test post',
    type: POST_TYPES.ENTRY,
  }
  
  const mockUser: ContestUser = {
    id: 'test-user-1',
    contestId: CONTEST_IDS.DEFAULT,
    userId: USER_IDS.CURRENT_USER,
    userName: 'Test User',
    totalCount: 10,
  }

  beforeEach(() => {
    service = new LocalStorageDataService()
    vi.clearAllMocks()
  })

  describe('Posts operations', () => {
    it('should get posts from localStorage', async () => {
      const mockPosts = [mockPost]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPosts))

      const posts = await service.getPosts()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('hotdog-contest-posts')
      expect(posts).toEqual(mockPosts)
    })

    it('should return empty array when no posts in localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const posts = await service.getPosts()

      expect(posts).toEqual([])
    })

    it('should handle timestamp conversion for posts', async () => {
      const postWithStringTimestamp = {
        ...mockPost,
        timestamp: '2023-01-01T00:00:00.000Z',
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify([postWithStringTimestamp]))

      const posts = await service.getPosts()

      expect(posts[0]?.timestamp).toBeInstanceOf(Date)
      expect(posts[0]?.timestamp?.toISOString()).toBe('2023-01-01T00:00:00.000Z')
    })

    it('should add a new post', async () => {
      const existingPosts = [mockPost]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingPosts))

      const postData = {
        contestId: CONTEST_IDS.DEFAULT,
        userId: USER_IDS.CURRENT_USER,
        userName: 'New User',
        count: 3,
        timestamp: new Date(),
        type: POST_TYPES.ENTRY as const,
      }

      const newPost = await service.addPost(postData)

      expect(newPost.id).toBeDefined()
      expect(newPost.count).toBe(3)
      expect(newPost.userName).toBe('New User')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should update an existing post', async () => {
      const existingPosts = [mockPost]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingPosts))

      const updates = { count: 8, description: 'Updated description' }
      const updatedPost = await service.updatePost(mockPost.id, updates)

      expect(updatedPost.count).toBe(8)
      expect(updatedPost.description).toBe('Updated description')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should throw error when updating non-existent post', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      await expect(
        service.updatePost('non-existent', { count: 5 })
      ).rejects.toThrow('Post with id non-existent not found')
    })

    it('should delete a post', async () => {
      const existingPosts = [mockPost]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingPosts))

      await service.deletePost(mockPost.id)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'hotdog-contest-posts',
        JSON.stringify([])
      )
    })

    it('should throw error when deleting non-existent post', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      await expect(
        service.deletePost('non-existent')
      ).rejects.toThrow('Post with id non-existent not found')
    })
  })

  describe('Users operations', () => {
    it('should get users from localStorage', async () => {
      const mockUsers = [mockUser]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUsers))

      const users = await service.getUsers()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('hotdog-contest-contest-users')
      expect(users).toEqual(mockUsers)
    })

    it('should return empty array when no users in localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const users = await service.getUsers()

      expect(users).toEqual([])
    })

    it('should add a new user', async () => {
      const existingUsers = [mockUser]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUsers))

      const userData = {
        contestId: CONTEST_IDS.DEFAULT,
        userId: USER_IDS.FRIEND,
        userName: 'Friend',
        totalCount: 0,
      }

      const newUser = await service.addUser(userData)

      expect(newUser.id).toBeDefined()
      expect(newUser.userName).toBe('Friend')
      expect(newUser.totalCount).toBe(0)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should update an existing user', async () => {
      const existingUsers = [mockUser]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingUsers))

      const updates = { totalCount: 15, userName: 'Updated User' }
      const updatedUser = await service.updateUser(mockUser.id, updates)

      expect(updatedUser.totalCount).toBe(15)
      expect(updatedUser.userName).toBe('Updated User')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should throw error when updating non-existent user', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      await expect(
        service.updateUser('non-existent', { totalCount: 5 })
      ).rejects.toThrow('User with id non-existent not found')
    })
  })

  describe('Batch operations', () => {
    it('should execute batch operations sequentially', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      const operations = [
        {
          type: 'create' as const,
          collection: 'posts' as const,
          data: {
            contestId: CONTEST_IDS.DEFAULT,
            userId: USER_IDS.CURRENT_USER,
            userName: 'Test',
            count: 1,
            timestamp: new Date(),
            type: POST_TYPES.ENTRY,
          },
        },
        {
          type: 'create' as const,
          collection: 'users' as const,
          data: {
            contestId: CONTEST_IDS.DEFAULT,
            userId: USER_IDS.CURRENT_USER,
            userName: 'Test',
            totalCount: 0,
          },
        },
      ]

      await service.batchUpdate(operations)

      // Should have called setItem twice (once for each create operation)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2)
    })

    it('should throw error for invalid batch operation', async () => {
      const operations = [
        {
          type: 'update' as const,
          collection: 'posts' as const,
          // Missing required id for update operation
          data: { count: 5 },
        },
      ]

      await expect(service.batchUpdate(operations)).rejects.toThrow(
        'Update operation requires id'
      )
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage getItem errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // Should not throw, should return empty array
      const posts = await service.getPosts()
      expect(posts).toEqual([])
    })

    it('should handle localStorage setItem errors', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage full')
      })

      const postData = {
        contestId: CONTEST_IDS.DEFAULT,
        userId: USER_IDS.CURRENT_USER,
        userName: 'Test',
        count: 1,
        timestamp: new Date(),
        type: POST_TYPES.ENTRY as const,
      }

      await expect(service.addPost(postData)).rejects.toThrow(
        'Failed to save data to hotdog-contest-posts'
      )
    })

    it('should handle malformed JSON in localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const posts = await service.getPosts()
      expect(posts).toEqual([])
    })
  })
})