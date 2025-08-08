import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  logError,
  logUserError,
  logStorageError,
  logValidationError,
} from './errorLogger'

describe('errorLogger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    process.env.NODE_ENV = originalNodeEnv
  })

  describe('logError', () => {
    it('should log error with basic information', () => {
      const error = new Error('Test error')
      const message = 'Something went wrong'

      logError({ message, error })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Something went wrong',
        expect.objectContaining({
          timestamp: expect.any(Date),
          error,
        })
      )
    })

    it('should log error with context and action', () => {
      const error = new Error('Test error')
      const message = 'Test message'
      const context = 'test-context'
      const action = 'test-action'

      logError({ message, error, context, action })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Test message',
        expect.objectContaining({
          context,
          action,
          timestamp: expect.any(Date),
          error,
        })
      )
    })

    it('should log error with userId', () => {
      const message = 'User action failed'
      const userId = 'user-123'

      logError({ message, userId })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] User action failed',
        expect.objectContaining({
          userId,
          timestamp: expect.any(Date),
        })
      )
    })

    it('should behave differently in production mode', () => {
      // Mock import.meta.env for production
      const originalEnv = { ...import.meta.env }
      vi.stubGlobal('import.meta', {
        env: { ...originalEnv, DEV: false, PROD: true, MODE: 'production' },
      })

      const error = new Error('Test error')
      const message = 'Production error'
      const context = 'test-context'

      logError({ message, error, context })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Production error',
        expect.objectContaining({
          context,
          timestamp: expect.any(Date),
        })
      )

      // Restore original environment
      vi.stubGlobal('import.meta', { env: originalEnv })
    })
  })

  describe('logUserError', () => {
    it('should log user error with proper context', () => {
      const error = new Error('User action failed')
      const message = 'Failed to save data'
      const userId = 'user-456'
      const action = 'save-post'

      logUserError(message, error, userId, action)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Failed to save data',
        expect.objectContaining({
          context: 'user-action',
          userId,
          action,
          error,
          timestamp: expect.any(Date),
        })
      )
    })

    it('should work without userId and action', () => {
      const error = new Error('Generic user error')
      const message = 'Something failed'

      logUserError(message, error)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Something failed',
        expect.objectContaining({
          context: 'user-action',
          error,
          timestamp: expect.any(Date),
        })
      )
    })
  })

  describe('logStorageError', () => {
    it('should log storage error with key', () => {
      const error = new Error('Storage quota exceeded')
      const message = 'Failed to save to localStorage'
      const key = 'user-data'

      logStorageError(message, error, key)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Failed to save to localStorage',
        expect.objectContaining({
          context: 'storage',
          action: 'key: user-data',
          error,
          timestamp: expect.any(Date),
        })
      )
    })

    it('should work without key', () => {
      const error = new Error('Storage error')
      const message = 'Storage failed'

      logStorageError(message, error)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Storage failed',
        expect.objectContaining({
          context: 'storage',
          error,
          timestamp: expect.any(Date),
        })
      )
    })
  })

  describe('logValidationError', () => {
    it('should log validation error with data', () => {
      const message = 'Invalid user data'
      const data = { name: '', age: -1 }
      const validator = 'user-validator'

      logValidationError(message, data, validator)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Invalid user data',
        expect.objectContaining({
          context: 'validation',
          action: validator,
          error: expect.any(Error),
          timestamp: expect.any(Date),
        })
      )

      // Check that the error contains the stringified data
      const errorObj = consoleSpy.mock.calls[0][1].error
      expect(errorObj.message).toContain(JSON.stringify(data, null, 2))
    })

    it('should work without validator', () => {
      const message = 'Validation failed'
      const data = { invalid: 'data' }

      logValidationError(message, data)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Validation failed',
        expect.objectContaining({
          context: 'validation',
          error: expect.any(Error),
          timestamp: expect.any(Date),
        })
      )
    })

    it('should handle circular references in data', () => {
      const message = 'Circular data error'
      const circularData: Record<string, unknown> = { name: 'test' }
      circularData.self = circularData

      // Should not throw error even with circular reference
      expect(() => {
        logValidationError(message, circularData, 'circular-validator')
      }).not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Error] Circular data error',
        expect.objectContaining({
          context: 'validation',
          action: 'circular-validator',
          timestamp: expect.any(Date),
        })
      )
    })
  })
})
