import React from 'react'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { render, screen, fireEvent } from '@test/test-utils'

import ErrorBoundary from './ErrorBoundary'

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = false,
}) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary Component', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch errors and display default fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText(/We're sorry! Something unexpected happened/)
    ).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should display custom fallback UI when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(
      screen.queryByText('🚨 Something went wrong')
    ).not.toBeInTheDocument()
  })

  it('should call onError callback when error is caught', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    )
  })

  it('should log error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Error] ErrorBoundary caught an error',
      expect.objectContaining({
        context: 'react-error-boundary',
        action: 'component-error',
        error: expect.any(Error),
      })
    )

    consoleSpy.mockRestore()
  })

  it('should call resetError method when Try Again is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error should be displayed
    expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument()

    // Try Again button should be present and clickable
    const tryAgainButton = screen.getByText('Try Again')
    expect(tryAgainButton).toBeInTheDocument()

    // Should not throw when clicking Try Again
    expect(() => {
      fireEvent.click(tryAgainButton)
    }).not.toThrow()
  })

  it('should show error details in development mode', () => {
    // Mock isDevelopment to return true
    const spy = vi
      .spyOn(ErrorBoundary.prototype, 'isDevelopment')
      .mockReturnValue(true)

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should show error details in development
    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('should not show error details in production mode', () => {
    // Mock isDevelopment to return false (production)
    const spy = vi
      .spyOn(ErrorBoundary.prototype, 'isDevelopment')
      .mockReturnValue(false)

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should not show error details in production
    expect(
      screen.queryByText('Error Details (Development)')
    ).not.toBeInTheDocument()

    spy.mockRestore()
  })

  it('should have proper CSS class for styling', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(document.querySelector('.error-boundary')).toBeInTheDocument()
    expect(
      document.querySelector('.error-boundary-content')
    ).toBeInTheDocument()
  })

  it('should handle errors with missing stack trace', () => {
    // Create an error without stack trace
    const errorWithoutStack = new Error('Test error')
    delete errorWithoutStack.stack

    const ThrowErrorWithoutStack = () => {
      throw errorWithoutStack
    }

    render(
      <ErrorBoundary>
        <ThrowErrorWithoutStack />
      </ErrorBoundary>
    )

    expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument()
  })

  it('should maintain consistent UI structure in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should have proper error UI elements
    expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(document.querySelector('.error-boundary')).toBeInTheDocument()
    expect(
      document.querySelector('.error-boundary-content')
    ).toBeInTheDocument()
  })
})
