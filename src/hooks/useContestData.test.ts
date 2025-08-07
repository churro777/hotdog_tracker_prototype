import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import useContestData from './useContestData'
import { CONTEST_IDS, USER_IDS, POST_TYPES } from '../constants'

// Mock useLocalStorage
vi.mock('./useLocalStorage', () => ({
  default: vi.fn((key, defaultValue) => {
    const [value, setValue] = React.useState(defaultValue)
    return [value, setValue]
  }),
}))

describe('useContestData', () => {
  const mockContestId = CONTEST_IDS.DEFAULT
  const mockCurrentUserId = USER_IDS.CURRENT_USER

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default data', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    expect(result.current.contestPosts).toHaveLength(1)
    expect(result.current.contestUsers).toHaveLength(5)
    expect(result.current.allContestPosts).toHaveLength(1)
    expect(result.current.allContestUsers).toHaveLength(5)
  })

  it('should filter posts and users for the specific contest', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    // All posts and users should belong to the contest
    result.current.contestPosts.forEach(post => {
      expect(post.contestId).toBe(mockContestId)
    })

    result.current.contestUsers.forEach(user => {
      expect(user.contestId).toBe(mockContestId)
    })
  })

  it('should add a new post successfully', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    const initialPostCount = result.current.contestPosts.length
    const initialUserCount = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )?.totalCount || 0

    act(() => {
      result.current.addPost(3, 'Great hotdogs!', 'image-url.jpg')
    })

    // Check that post was added
    expect(result.current.contestPosts).toHaveLength(initialPostCount + 1)

    // Find the new post
    const newPost = result.current.contestPosts.find(
      p => p.description === 'Great hotdogs!'
    )
    expect(newPost).toBeDefined()
    expect(newPost?.count).toBe(3)
    expect(newPost?.userId).toBe(mockCurrentUserId)
    expect(newPost?.userName).toBe('You')
    expect(newPost?.type).toBe(POST_TYPES.ENTRY)
    expect(newPost?.image).toBe('image-url.jpg')
    expect(newPost?.timestamp).toBeInstanceOf(Date)

    // Check that user's total count was updated
    const updatedUser = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )
    expect(updatedUser?.totalCount).toBe(initialUserCount + 3)
  })

  it('should not add post if user is not found', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, 'non-existent-user')
    )

    const initialPostCount = result.current.contestPosts.length

    act(() => {
      result.current.addPost(5, 'Should not be added')
    })

    // Post count should remain the same
    expect(result.current.contestPosts).toHaveLength(initialPostCount)
  })

  it('should edit an existing post successfully', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    // First add a post
    act(() => {
      result.current.addPost(5, 'Original description')
    })

    const addedPost = result.current.contestPosts.find(
      p => p.description === 'Original description'
    )
    expect(addedPost).toBeDefined()

    const originalUsertotalCount = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )?.totalCount || 0

    // Edit the post
    act(() => {
      result.current.editPost(
        addedPost!.id,
        8,
        'Updated description'
      )
    })

    // Find the edited post
    const editedPost = result.current.contestPosts.find(
      p => p.id === addedPost!.id
    )
    expect(editedPost?.count).toBe(8)
    expect(editedPost?.description).toBe('Updated description')

    // Check that user's total count was adjusted (5 removed, 8 added = +3)
    const updatedUser = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )
    expect(updatedUser?.totalCount).toBe(originalUsertotalCount - 5 + 8)
  })

  it('should handle editing post with no original count', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    // Add a post without count (undefined)
    act(() => {
      result.current.addPost(0, 'Zero count post')
    })

    const addedPost = result.current.contestPosts.find(
      p => p.description === 'Zero count post'
    )

    const originalUserTotalCount = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )?.totalCount || 0

    // Edit the post to have a count
    act(() => {
      result.current.editPost(addedPost!.id, 7, 'Now has count')
    })

    // Check that user's total count was updated correctly (0 removed, 7 added)
    const updatedUser = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )
    expect(updatedUser?.totalCount).toBe(originalUserTotalCount + 7)
  })

  it('should handle timestamp conversion correctly', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    act(() => {
      result.current.addPost(1, 'Test timestamp')
    })

    const newPost = result.current.contestPosts.find(
      p => p.description === 'Test timestamp'
    )

    expect(newPost?.timestamp).toBeInstanceOf(Date)
    expect(new Date(newPost?.timestamp || 0).getTime()).toBeCloseTo(
      Date.now(),
      -3 // Within 1 second
    )
  })

  it('should provide setter functions for external data manipulation', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    expect(typeof result.current.setAllContestPosts).toBe('function')
    expect(typeof result.current.setAllContestUsers).toBe('function')
  })

  it('should add posts successfully', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    const initialCount = result.current.contestPosts.length

    // Add a post
    act(() => {
      result.current.addPost(3, 'Test post')
    })

    // Check that post was added
    expect(result.current.contestPosts.length).toBe(initialCount + 1)
    
    // Check that we can find the post
    const newPost = result.current.contestPosts.find(p => p.description === 'Test post')
    
    expect(newPost).toBeDefined()
    expect(newPost?.count).toBe(3)
    expect(newPost?.userId).toBe(mockCurrentUserId)
    expect(newPost?.type).toBe(POST_TYPES.ENTRY)
  })

  it('should maintain data consistency with add and edit operations', () => {
    const { result } = renderHook(() =>
      useContestData(mockContestId, mockCurrentUserId)
    )

    // Get initial state
    const initialUser = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )
    const initialTotalCount = initialUser?.totalCount || 0
    const initialPostCount = result.current.contestPosts.length

    // Add a post
    act(() => {
      result.current.addPost(5, 'Test post')
    })

    // Verify post was added and user count updated
    let currentUser = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )
    expect(currentUser?.totalCount).toBe(initialTotalCount + 5)
    expect(result.current.contestPosts.length).toBe(initialPostCount + 1)

    // Find and edit the post
    const postToEdit = result.current.contestPosts.find(
      p => p.description === 'Test post'
    )
    expect(postToEdit).toBeDefined()

    act(() => {
      result.current.editPost(postToEdit!.id, 8, 'Edited test post')
    })

    // Verify edit updated counts correctly (removed 5, added 8 = +3)
    currentUser = result.current.contestUsers.find(
      u => u.userId === mockCurrentUserId
    )
    expect(currentUser?.totalCount).toBe(initialTotalCount + 8)

    // Verify post was edited
    const editedPost = result.current.contestPosts.find(
      p => p.id === postToEdit!.id
    )
    expect(editedPost?.count).toBe(8)
    expect(editedPost?.description).toBe('Edited test post')
  })
})