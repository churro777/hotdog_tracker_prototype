import { describe, it, expect, vi } from 'vitest'

import { render, screen } from '@test/test-utils'

import App from './App'

// Mock all the hooks with simple implementations
vi.mock('@hooks/useContestData', () => ({
  default: () => ({
    contestPosts: [],
    contestUsers: [
      {
        id: 'cu-1',
        userId: '1',
        userName: 'You',
        totalCount: 5,
        contestId: 'test',
      },
      {
        id: 'cu-2',
        userId: '2',
        userName: 'Joey Chestnut',
        totalCount: 23,
        contestId: 'test',
      },
    ],
    addPost: vi.fn(),
    editPost: vi.fn(),
  }),
}))

vi.mock('@hooks/useTheme', () => ({
  default: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
  }),
}))

describe('App Component - Basic Integration', () => {
  it('should render app title', () => {
    render(<App />)
    expect(screen.getByText('Hot Dog Tracker')).toBeInTheDocument()
  })

  it('should render navigation tabs', () => {
    render(<App />)

    // Find buttons by their role, not by duplicate text
    const buttons = screen.getAllByRole('button')
    const tabTexts = buttons
      .map(btn => btn.textContent)
      .filter(
        text =>
          (text?.includes('🏆') ?? false) ||
          (text?.includes('📰') ?? false) ||
          (text?.includes('📝') ?? false) ||
          (text?.includes('📔') ?? false)
      )

    expect(tabTexts).toHaveLength(4)
  })

  it('should render settings button', () => {
    render(<App />)
    expect(screen.getByText('⚙️')).toBeInTheDocument()
  })

  it('should have proper app structure', () => {
    render(<App />)

    // Check for main structural elements
    expect(document.querySelector('.app')).toBeInTheDocument()
    expect(document.querySelector('.app-header')).toBeInTheDocument()
    expect(document.querySelector('.tab-nav')).toBeInTheDocument()
    expect(document.querySelector('.tab-content')).toBeInTheDocument()
  })

  it('should render some leaderboard content by default', () => {
    render(<App />)

    // Should show some user names from the mocked data
    expect(screen.getByText('Joey Chestnut')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })
})
