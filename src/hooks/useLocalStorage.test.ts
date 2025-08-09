import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { localStorageMock } from '../test/setup'

import useLocalStorage from './useLocalStorage'

// Define typed mock interface for localStorage to avoid ESLint unsafe call errors
interface MockedStorage {
  getItem: {
    mockReturnValue: (value: string | null) => void
    toHaveBeenCalledWith: (key: string) => void
    mockClear: () => void
    mockImplementation: (fn: () => void) => void
  }
  setItem: {
    toHaveBeenCalledWith: (key: string, value: string) => void
    not: { toHaveBeenCalled: () => void }
    mockClear: () => void
    mockImplementation: (fn: () => void) => void
  }
}

const mockLocalStorage = localStorageMock as unknown as MockedStorage

describe('useLocalStorage', () => {
  it('should return default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('should return parsed value from localStorage when it exists', () => {
    const mockValue = { name: 'John', age: 30 }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockValue))

    const { result } = renderHook(() =>
      useLocalStorage('test-key', { name: '', age: 0 })
    )

    expect(result.current[0]).toEqual(mockValue)
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key')
  })

  it('should save value to localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new value')
    )
  })

  it('should handle localStorage parsing errors gracefully', () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => void 0)
    mockLocalStorage.getItem.mockReturnValue('invalid json {')

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))

    expect(result.current[0]).toBe('fallback')
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Error] Error parsing localStorage value for key "test-key"',
      expect.objectContaining({
        context: 'storage',
        action: 'key: test-key',
        error: expect.any(Error) as Error,
      })
    )

    consoleSpy.mockRestore()
  })

  it('should work with complex objects', () => {
    const complexObject = {
      users: [{ id: 1, name: 'Alice' }],
      settings: { theme: 'dark', notifications: true },
      lastUpdated: new Date().toISOString(),
    }

    const { result } = renderHook(() =>
      useLocalStorage('complex-key', {
        users: [] as { id: number; name: string }[],
        settings: {} as { theme: string; notifications: boolean },
        lastUpdated: '',
      })
    )

    act(() => {
      result.current[1](complexObject)
    })

    expect(result.current[0]).toEqual(complexObject)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'complex-key',
      JSON.stringify(complexObject)
    )
  })

  it('should work with function updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))

    act(() => {
      result.current[1](prev => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('should not save undefined or null values to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    // Clear previous calls from initialization
    mockLocalStorage.setItem.mockClear()

    act(() => {
      result.current[1](undefined as never)
    })

    // Should not call setItem for undefined
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()

    act(() => {
      result.current[1](null as never)
    })

    // Should not call setItem for null
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
  })

  it('should handle boolean values correctly', () => {
    const { result } = renderHook(() => useLocalStorage('boolean-key', false))

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0]).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'boolean-key',
      JSON.stringify(true)
    )
  })

  it('should handle array values correctly', () => {
    const testArray = [1, 2, 3, 4, 5]
    const { result } = renderHook(() =>
      useLocalStorage('array-key', [] as number[])
    )

    act(() => {
      result.current[1](testArray)
    })

    expect(result.current[0]).toEqual(testArray)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'array-key',
      JSON.stringify(testArray)
    )
  })

  it('should handle localStorage setItem errors gracefully', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => void 0)

    // Mock setItem to throw an error (e.g., storage quota exceeded)
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    // State should still update even if localStorage fails
    expect(result.current[0]).toBe('new value')
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Error] Error saving to localStorage for key "test-key"',
      expect.objectContaining({
        context: 'storage',
        action: 'key: test-key',
        error: expect.any(Error) as Error,
      })
    )

    // Restore mocks
    consoleSpy.mockRestore()
  })
})
