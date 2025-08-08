import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import type { ContestPost, ContestUser } from '../types'
import { CONTEST_IDS, USER_IDS, POST_TYPES } from '../constants'

/**
 * Mock data for testing components
 */
export const mockContestUsers: ContestUser[] = [
  {
    id: 'cu-1',
    contestId: CONTEST_IDS.DEFAULT,
    userId: USER_IDS.JOEY_CHESTNUT,
    userName: 'Joey Chestnut',
    totalCount: 23,
  },
  {
    id: 'cu-2',
    contestId: CONTEST_IDS.DEFAULT,
    userId: USER_IDS.CURRENT_USER,
    userName: 'You',
    totalCount: 5,
  },
]

export const mockContestPosts: ContestPost[] = [
  {
    id: '1',
    contestId: CONTEST_IDS.DEFAULT,
    userId: USER_IDS.CURRENT_USER,
    userName: 'You',
    count: 3,
    timestamp: new Date('2024-01-01T12:00:00Z'),
    description: 'First post!',
    type: POST_TYPES.ENTRY,
  },
  {
    id: '2',
    contestId: CONTEST_IDS.DEFAULT,
    userId: USER_IDS.JOEY_CHESTNUT,
    userName: 'Joey Chestnut',
    count: 5,
    timestamp: new Date('2024-01-01T13:00:00Z'),
    description: 'Champion performance',
    type: POST_TYPES.ENTRY,
  },
  {
    id: '3',
    contestId: CONTEST_IDS.DEFAULT,
    userId: USER_IDS.CURRENT_USER,
    userName: 'You',
    timestamp: new Date('2024-01-01T14:00:00Z'),
    description: 'Welcome message',
    type: POST_TYPES.JOIN,
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
    currentUserId: USER_IDS.CURRENT_USER,
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
    contestUsers: mockContestUsers,
    isDarkMode: false,
  },
  journalTab: {
    posts: mockContestPosts.filter(p => p.userId === USER_IDS.CURRENT_USER),
    currentUserId: USER_IDS.CURRENT_USER,
    onEditPost: mockFunctions.onEditPost,
  },
}

// Re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
export { customRender as render }
