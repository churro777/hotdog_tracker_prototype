import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import * as themeModule from '../constants/theme'
import { localStorageMock } from '../test/setup'

import useTheme from './useTheme'

// Mock the theme module
vi.mock('../constants/theme', () => ({
  applyTheme: vi.fn(),
  getCSSVariable: vi.fn(() => 'mocked-value'),
}))

describe('useTheme', () => {
  const mockApplyTheme = vi.mocked(themeModule.applyTheme)
  const mockGetCSSVariable = vi.mocked(themeModule.getCSSVariable)

  // Get references to the mocked methods
  const mockGetItem = localStorageMock.getItem
  const mockSetItem = localStorageMock.setItem

  let mockAdd: ReturnType<typeof vi.spyOn>
  let mockRemove: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Mock document.body.classList methods
    mockAdd = vi
      .spyOn(document.body.classList, 'add')
      .mockImplementation(() => void 0)
    mockRemove = vi
      .spyOn(document.body.classList, 'remove')
      .mockImplementation(() => void 0)
  })

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.theme).toBe('light')
  })

  it('should initialize with stored dark mode preference', () => {
    // Mock localStorage to return dark mode
    mockGetItem.mockReturnValue(JSON.stringify(true))

    const { result } = renderHook(() => useTheme())

    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')
  })

  it('should apply theme and CSS classes on initialization', () => {
    renderHook(() => useTheme())

    expect(mockApplyTheme).toHaveBeenCalledWith(false)
    expect(mockRemove).toHaveBeenCalledWith('dark-mode')
  })

  it('should apply dark mode theme and CSS classes', () => {
    mockGetItem.mockReturnValue(JSON.stringify(true))

    renderHook(() => useTheme())

    expect(mockApplyTheme).toHaveBeenCalledWith(true)
    expect(mockAdd).toHaveBeenCalledWith('dark-mode')
  })

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.isDarkMode).toBe(false)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')
    expect(mockApplyTheme).toHaveBeenCalledWith(true)
    expect(mockAdd).toHaveBeenCalledWith('dark-mode')
  })

  it('should toggle theme from dark to light', () => {
    mockGetItem.mockReturnValue(JSON.stringify(true))
    const { result } = renderHook(() => useTheme())

    expect(result.current.isDarkMode).toBe(true)

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.theme).toBe('light')
    expect(mockApplyTheme).toHaveBeenCalledWith(false)
    expect(mockRemove).toHaveBeenCalledWith('dark-mode')
  })

  it('should set specific theme to dark', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.isDarkMode).toBe(true)
    expect(result.current.theme).toBe('dark')
  })

  it('should set specific theme to light', () => {
    mockGetItem.mockReturnValue(JSON.stringify(true))
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('light')
    })

    expect(result.current.isDarkMode).toBe(false)
    expect(result.current.theme).toBe('light')
  })

  it('should provide getCSSVariable function', () => {
    const { result } = renderHook(() => useTheme())

    const cssValue = result.current.getCSSVariable('--test-variable')

    expect(cssValue).toBe('mocked-value')
    expect(mockGetCSSVariable).toHaveBeenCalledWith('--test-variable')
  })

  it('should persist theme changes to localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(mockSetItem).toHaveBeenCalledWith(
      'hotdog-contest-dark-mode',
      JSON.stringify(true)
    )
  })

  it('should handle multiple theme changes correctly', () => {
    const { result } = renderHook(() => useTheme())

    // Start with light
    expect(result.current.theme).toBe('light')

    // Toggle to dark
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')

    // Set to light
    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.theme).toBe('light')

    // Set to dark
    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.theme).toBe('dark')

    // Toggle back to light
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
  })

  it('should apply theme changes on every state update', () => {
    const { result } = renderHook(() => useTheme())

    // Clear previous calls
    mockApplyTheme.mockClear()

    act(() => {
      result.current.toggleTheme()
    })

    expect(mockApplyTheme).toHaveBeenCalledTimes(1)
    expect(mockApplyTheme).toHaveBeenCalledWith(true)

    act(() => {
      result.current.setTheme('light')
    })

    expect(mockApplyTheme).toHaveBeenCalledTimes(2)
    expect(mockApplyTheme).toHaveBeenLastCalledWith(false)
  })
})
