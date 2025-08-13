import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import type { User } from '@types'

import LeaderboardTab from './LeaderboardTab'

describe('LeaderboardTab - Tie Handling', () => {
  it('should handle all users tied at zero correctly (rank 4)', () => {
    const tiedUsers: User[] = [
      {
        id: '1',
        email: 'user1@test.com',
        displayName: 'User One',
        totalCount: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '2',
        email: 'user2@test.com',
        displayName: 'User Two',
        totalCount: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '3',
        email: 'user3@test.com',
        displayName: 'User Three',
        totalCount: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '4',
        email: 'user4@test.com',
        displayName: 'User Four',
        totalCount: 0,
        createdAt: new Date(),
        lastActive: new Date(),
      },
    ]

    render(<LeaderboardTab contestUsers={tiedUsers} />)

    // All users should show rank #2 (no ties for 1st place rule)
    const rank2Elements = screen.getAllByText('🥈')
    expect(rank2Elements).toHaveLength(4)

    // Verify all users are displayed
    expect(screen.getByText('User One')).toBeInTheDocument()
    expect(screen.getByText('User Two')).toBeInTheDocument()
    expect(screen.getByText('User Three')).toBeInTheDocument()
    expect(screen.getByText('User Four')).toBeInTheDocument()
  })

  it('should handle complex tie scenarios correctly', () => {
    const complexUsers: User[] = [
      {
        id: '1',
        email: 'user1@test.com',
        displayName: 'Leader',
        totalCount: 15,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '2',
        email: 'user2@test.com',
        displayName: 'Tied Second A',
        totalCount: 10,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '3',
        email: 'user3@test.com',
        displayName: 'Tied Second B',
        totalCount: 10,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '4',
        email: 'user4@test.com',
        displayName: 'Tied Second C',
        totalCount: 10,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '5',
        email: 'user5@test.com',
        displayName: 'Fifth Place',
        totalCount: 8,
        createdAt: new Date(),
        lastActive: new Date(),
      },
    ]

    render(<LeaderboardTab contestUsers={complexUsers} />)

    // Leader should have gold medal (rank 1)
    expect(screen.getByText('🥇')).toBeInTheDocument()
    expect(screen.getByText('Leader')).toBeInTheDocument()

    // Three users tied for second should get rank #4 (positional ranking)
    const rank4Elements = screen.getAllByText('#4')
    expect(rank4Elements).toHaveLength(3)

    // Fifth place user should have rank #5 (not #4)
    expect(screen.getByText('#5')).toBeInTheDocument()
    expect(screen.getByText('Fifth Place')).toBeInTheDocument()
  })

  it('should handle two-way tie for highest score (becomes rank 2)', () => {
    const tieForFirst: User[] = [
      {
        id: '1',
        email: 'user1@test.com',
        displayName: 'Co-Leader A',
        totalCount: 20,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '2',
        email: 'user2@test.com',
        displayName: 'Co-Leader B',
        totalCount: 20,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '3',
        email: 'user3@test.com',
        displayName: 'Third Place',
        totalCount: 15,
        createdAt: new Date(),
        lastActive: new Date(),
      },
    ]

    render(<LeaderboardTab contestUsers={tieForFirst} />)

    // Two users should have silver medals (tied for 2nd, no ties for 1st)
    const silverMedals = screen.getAllByText('🥈')
    expect(silverMedals).toHaveLength(2)

    // Third place should have bronze medal (rank 3)
    expect(screen.getByText('🥉')).toBeInTheDocument()
    expect(screen.getByText('Third Place')).toBeInTheDocument()
  })

  it('should award rank 1 only when one person has the highest score', () => {
    const clearWinner: User[] = [
      {
        id: '1',
        email: 'user1@test.com',
        displayName: 'Clear Winner',
        totalCount: 25,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '2',
        email: 'user2@test.com',
        displayName: 'Second Place',
        totalCount: 20,
        createdAt: new Date(),
        lastActive: new Date(),
      },
      {
        id: '3',
        email: 'user3@test.com',
        displayName: 'Third Place',
        totalCount: 15,
        createdAt: new Date(),
        lastActive: new Date(),
      },
    ]

    render(<LeaderboardTab contestUsers={clearWinner} />)

    // Only one gold medal for clear winner
    const goldMedals = screen.getAllByText('🥇')
    expect(goldMedals).toHaveLength(1)
    expect(screen.getByText('Clear Winner')).toBeInTheDocument()

    // One silver medal for second place
    expect(screen.getByText('🥈')).toBeInTheDocument()
    expect(screen.getByText('Second Place')).toBeInTheDocument()

    // One bronze medal for third place
    expect(screen.getByText('🥉')).toBeInTheDocument()
    expect(screen.getByText('Third Place')).toBeInTheDocument()
  })
})
