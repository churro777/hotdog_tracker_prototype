import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as themeModule from '../constants/theme'
import { localStorageMock } from '../test/setup'

// Define typed mock interface for localStorage
interface MockedStorage {
  getItem: {
    mockReturnValue: (value: string | null) => void
    mockImplementation: (fn: (key: string) => string | null) => void
    toHaveBeenCalledWith: (key: string) => void
  }
  setItem: {
    toHaveBeenCalledWith: (key: string, value: string) => void
  }
}

// Create typed references to avoid unsafe calls
const mockLocalStorage = localStorageMock as unknown as MockedStorage

import useTheme from './useTheme'

// Mock the theme module
vi.mock('../constants/theme', () => ({
  applyTheme: vi.fn(),
  getCSSVariable: vi.fn(() => 'mocked-value'),
  getTheme: vi.fn((themeName: string) => ({
    name: themeName === 'dark' ? 'Dark' : 'Light',
    colors: {
      '--bg-primary': themeName === 'dark' ? '#1a1a1a' : '#ffffff',
      '--text-primary': themeName === 'dark' ? '#ffffff' : '#343a40',
    },
  })),
  THEME_NAMES: ['light', 'dark'],
}))

describe('useTheme', () => {
  const mockApplyTheme = vi.mocked(themeModule.applyTheme)
  const mockGetCSSVariable = vi.mocked(themeModule.getCSSVariable)

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.theme).toBe('light')
    expect(result.current.themeName).toBe('light')
    expect(result.current.availableThemes).toEqual(['light', 'dark'])
  })

  it('should initialize with stored dark mode preference', () => {
    // Mock both old and new storage keys
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'hotdog-contest-dark-mode') return JSON.stringify(true)
      if (key === 'theme') return JSON.stringify('light')
      return null
    })

    const { result } = renderHook(() => useTheme())

    // Should migrate from old dark mode to new theme system
    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')
    expect(result.current.themeName).toBe('dark')
  })

  it('should apply theme on initialization', () => {
    renderHook(() => useTheme())

    expect(mockApplyTheme).toHaveBeenCalledWith('light')
  })

  it('should apply dark mode theme on initialization', () => {
    // Mock both old and new storage keys
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'hotdog-contest-dark-mode') return JSON.stringify(true)
      if (key === 'theme') return JSON.stringify('light')
      return null
    })

    renderHook(() => useTheme())

    expect(mockApplyTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.isDarkMode).toBe(false)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')
    expect(result.current.themeName).toBe('dark')
    expect(mockApplyTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle theme from dark to light', () => {
    // Mock both old and new storage keys
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'hotdog-contest-dark-mode') return JSON.stringify(true)
      if (key === 'theme') return JSON.stringify('light')
      return null
    })
    const { result } = renderHook(() => useTheme())

    expect(result.current.isDarkMode).toBe(true)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.theme).toBe('light')
    expect(result.current.themeName).toBe('light')
    expect(mockApplyTheme).toHaveBeenCalledWith('light')
  })

  it('should set specific theme to dark', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')
    expect(result.current.themeName).toBe('dark')
  })

  it('should set specific theme to light', () => {
    // Mock both old and new storage keys - start with dark
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'hotdog-contest-dark-mode') return JSON.stringify(true)
      if (key === 'theme') return JSON.stringify('light')
      return null
    })
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.theme).toBe('light')
    expect(result.current.themeName).toBe('light')
  })

  it('should provide getCSSVariable function', () => {
    const { result } = renderHook(() => useTheme())

    const value = result.current.getCSSVariable('--test-variable')

    expect(value).toBe('mocked-value')
    expect(mockGetCSSVariable).toHaveBeenCalledWith('--test-variable')
  })

  it('should set theme by name', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setThemeName('dark')
    })

    expect(result.current.themeName).toBe('dark')
    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')
  })

  it('should handle multiple theme changes correctly', () => {
    const { result } = renderHook(() => useTheme())

    // Start with light
    expect(result.current.themeName).toBe('light')

    // Toggle to dark
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.themeName).toBe('dark')

    // Set back to light using new API
    act(() => {
      result.current.setThemeName('light')
    })
    expect(result.current.themeName).toBe('light')

    // Toggle to dark again
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.themeName).toBe('dark')
  })

  it('should apply theme changes on every state update', () => {
    const { result } = renderHook(() => useTheme())

    // Initial render
    expect(mockApplyTheme).toHaveBeenCalledTimes(1)
    expect(mockApplyTheme).toHaveBeenCalledWith('light')

    act(() => {
      result.current.setThemeName('dark')
    })

    expect(mockApplyTheme).toHaveBeenCalledTimes(2)
    expect(mockApplyTheme).toHaveBeenLastCalledWith('dark')
  })
})

export {}
