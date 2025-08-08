import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import FeedTab from './FeedTab'
import { createMockProps } from '../../test/test-utils'

// Mock the usePostEdit hook with simple return values
vi.mock('../../hooks/usePostEdit', () => ({
  default: () => ({
    editingPostId: null,
    editCount: '',
    editDescription: '',
    setEditCount: vi.fn(),
    setEditDescription: vi.fn(),
    startEditing: vi.fn(),
    saveEdit: vi.fn(),
    cancelEdit: vi.fn(),
  }),
}))

describe('FeedTab Component - Basic Functionality', () => {
  it('should render feed header correctly', () => {
    const props = createMockProps.feedTab
    render(<FeedTab {...props} />)

    expect(screen.getByText('📰 Contest Feed')).toBeInTheDocument()
  })

  it('should render posts when provided', () => {
    const props = createMockProps.feedTab
    render(<FeedTab {...props} />)

    // Check that some post content is rendered
    expect(screen.getByText('First post!')).toBeInTheDocument()
    expect(screen.getByText('Champion performance')).toBeInTheDocument()
  })

  it('should show empty state when no posts', () => {
    const props = { ...createMockProps.feedTab, posts: [] }
    render(<FeedTab {...props} />)

    expect(screen.getByText(/No posts yet/)).toBeInTheDocument()
  })

  it('should render user names correctly', () => {
    const props = createMockProps.feedTab
    render(<FeedTab {...props} />)

    expect(screen.getByText('Joey Chestnut')).toBeInTheDocument()
    // Note: "You" appears multiple times, so we'll check it exists
    expect(screen.getAllByText('You').length).toBeGreaterThan(0)
  })

  it('should have correct CSS classes', () => {
    const props = createMockProps.feedTab
    render(<FeedTab {...props} />)

    // Check that tab panel container exists
    expect(document.querySelector('.tab-panel')).toBeInTheDocument()
  })
})
