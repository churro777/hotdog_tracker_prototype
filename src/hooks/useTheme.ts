import { useEffect } from 'react'

import { STORAGE_KEYS } from '@constants'
import {
  applyTheme,
  getCSSVariable,
  getTheme,
  THEME_NAMES,
  type ThemeMode,
  type ThemeName,
} from '@constants/theme'

import useLocalStorage from './useLocalStorage'

/**
 * Return type for the useTheme hook
 * @interface UseThemeReturn
 */
interface UseThemeReturn {
  /** Whether dark mode is currently active (backward compatibility) */
  isDarkMode: boolean
  /** Current theme mode ('light' or 'dark') - backward compatibility */
  theme: ThemeMode
  /** Current theme name */
  themeName: ThemeName
  /** All available theme names */
  availableThemes: ThemeName[]
  /** Current theme definition */
  currentTheme: ReturnType<typeof getTheme>
  /** Function to toggle between light and dark themes */
  toggleTheme: () => void
  /** Function to set a specific theme (backward compatibility) */
  setTheme: (theme: ThemeMode) => void
  /** Function to set theme by name */
  setThemeName: (themeName: ThemeName) => void
  /** Function to get CSS variable values */
  getCSSVariable: (variableName: string) => string
}

/**
 * Custom hook for managing application themes with support for multiple color schemes.
 * Handles theme persistence via localStorage and applies CSS variables and classes.
 * Maintains backward compatibility with the old dark/light mode system.
 *
 * @returns {UseThemeReturn} Object containing theme state and management functions
 */
function useTheme(): UseThemeReturn {
  // New theme system - stores theme name
  const [currentThemeName, setCurrentThemeName] = useLocalStorage<ThemeName>(
    'theme',
    'light'
  )

  // Initialize from old dark mode setting on first load
  const [isDarkModeFromStorage] = useLocalStorage<boolean>(
    STORAGE_KEYS.DARK_MODE,
    false
  )

  // One-time migration from old dark mode setting - only run on mount
  useEffect(() => {
    // Only migrate if theme is still at default and we have dark mode preference
    if (isDarkModeFromStorage && currentThemeName === 'light') {
      setCurrentThemeName('dark')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount to prevent interference with user changes

  const theme: ThemeMode = currentThemeName === 'dark' ? 'dark' : 'light'
  const currentTheme = getTheme(currentThemeName)

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(currentThemeName)
  }, [currentThemeName])

  /**
   * Toggles between light and dark themes (backward compatibility).
   */
  const toggleTheme = () => {
    const newTheme: ThemeName = currentThemeName === 'dark' ? 'light' : 'dark'
    setCurrentThemeName(newTheme)
  }

  /**
   * Sets a specific theme mode (backward compatibility).
   *
   * @param {ThemeMode} newTheme - The theme to set ('light' or 'dark')
   */
  const setTheme = (newTheme: ThemeMode) => {
    setCurrentThemeName(newTheme as ThemeName)
  }

  /**
   * Sets theme by name (new theme system).
   *
   * @param {ThemeName} themeName - The theme name to set
   */
  const setThemeName = (themeName: ThemeName) => {
    setCurrentThemeName(themeName)
  }

  return {
    isDarkMode: currentThemeName === 'dark',
    theme,
    themeName: currentThemeName,
    availableThemes: THEME_NAMES,
    currentTheme,
    toggleTheme,
    setTheme,
    setThemeName,
    getCSSVariable,
  }
}

export default useTheme
