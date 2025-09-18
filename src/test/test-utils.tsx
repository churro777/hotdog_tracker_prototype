import React from 'react'

import { render, type RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

import { CONTEST_IDS } from '@constants'
import type { ContestPost, User, ContestUser } from '@types'

/**
 * Mock data for testing components (simplified architecture)
 */
export const mockContestUsers: User[] = [
  {
    id: 'joey-chestnut',
    email: 'joey@example.com',
    displayName: 'Joey Chestnut',
    totalCount: 23,
    createdAt: new Date('2024-01-01'),
    lastActive: new Date('2024-01-02'),
  },
  {
    id: 'current-user',
    email: 'user@example.com',
    displayName: 'You',
    totalCount: 5,
    createdAt: new Date('2024-01-01'),
    lastActive: new Date('2024-01-02'),
  },
]

/**
 * Legacy mock data for migration compatibility
 */
export const mockLegacyContestUsers: ContestUser[] = [
  {
    id: 'cu-1',
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'joey-chestnut',
    userName: 'Joey Chestnut',
    totalCount: 23,
  },
  {
    id: 'cu-2',
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'current-user',
    userName: 'You',
    totalCount: 5,
  },
]

export const mockContestPosts: ContestPost[] = [
  {
    id: '1',
    contestId: 'default',
    userId: 'current-user',
    userName: 'You',
    count: 3,
    timestamp: new Date('2024-01-01T12:00:00Z'),
    description: 'First post!',
  },
  {
    id: '2',
    contestId: 'default',
    userId: 'joey-chestnut',
    userName: 'Joey Chestnut',
    count: 5,
    timestamp: new Date('2024-01-01T13:00:00Z'),
    description: 'Champion performance',
  },
  {
    id: '3',
    contestId: 'default',
    userId: 'current-user',
    userName: 'You',
    count: 1,
    timestamp: new Date('2024-01-01T14:00:00Z'),
    description: 'Welcome message',
  },
]

/**
 * Mock functions for component testing
 */
export const mockFunctions = {
  onEditPost: vi.fn(),
  onAddPost: vi.fn(),
  setActiveTab: vi.fn(),
  onToggleTheme: vi.fn(),
  onClose: vi.fn(),
  onClearData: vi.fn(),
  onLoadMore: vi.fn(),
  onToggleReaction: vi.fn(),
  onToggleFlag: vi.fn(),
}

/**
 * Custom render function that includes common providers
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: AllProviders, ...options })
}

/**
 * Helper to create mock props for components
 */
export const createMockProps = {
  feedTab: {
    posts: mockContestPosts,
    onEditPost: mockFunctions.onEditPost,
    currentUserId: 'current-user',
    hasMorePosts: false,
    isLoadingMore: false,
    onLoadMore: mockFunctions.onLoadMore,
    onToggleReaction: mockFunctions.onToggleReaction,
    onToggleFlag: mockFunctions.onToggleFlag,
    isAuthenticated: true,
  },
  logTab: {
    onAddPost: mockFunctions.onAddPost,
    setActiveTab: mockFunctions.setActiveTab,
  },
  settingsModal: {
    isDarkMode: false,
    onToggleTheme: mockFunctions.onToggleTheme,
    onClose: mockFunctions.onClose,
    onClearData: mockFunctions.onClearData,
  },
  leaderboardTab: {
    users: mockContestUsers,
    isDarkMode: false,
  },
  journalTab: {
    posts: mockContestPosts.filter(p => p.userId === 'current-user'),
    currentUserId: 'current-user',
    onEditPost: mockFunctions.onEditPost,
  },
}

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }
