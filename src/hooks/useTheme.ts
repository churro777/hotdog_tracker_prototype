import { useEffect } from 'react'
import { applyTheme, getCSSVariable, type ThemeMode } from '../constants/theme'
import useLocalStorage from './useLocalStorage'
import { STORAGE_KEYS } from '../constants'

/**
 * Return type for the useTheme hook
 * @interface UseThemeReturn
 */
interface UseThemeReturn {
  /** Whether dark mode is currently active */
  isDarkMode: boolean
  /** Current theme mode ('light' or 'dark') */
  theme: ThemeMode
  /** Function to toggle between light and dark themes */
  toggleTheme: () => void
  /** Function to set a specific theme */
  setTheme: (theme: ThemeMode) => void
  /** Function to get CSS variable values */
  getCSSVariable: (variableName: string) => string
}

/**
 * Custom hook for managing application theme (light/dark mode).
 * Handles theme persistence via localStorage and applies CSS variables and classes.
 * Provides functions to toggle or set specific themes.
 *
 * @returns {UseThemeReturn} Object containing theme state and management functions
 */
function useTheme(): UseThemeReturn {
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    STORAGE_KEYS.DARK_MODE,
    false
  )

  const theme: ThemeMode = isDarkMode ? 'dark' : 'light'

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(isDarkMode)

    // Also apply CSS class for backward compatibility
    if (isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  /**
   * Toggles between light and dark themes.
   */
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  /**
   * Sets a specific theme mode.
   *
   * @param {ThemeMode} newTheme - The theme to set ('light' or 'dark')
   */
  const setTheme = (newTheme: ThemeMode) => {
    setIsDarkMode(newTheme === 'dark')
  }

  return {
    isDarkMode,
    theme,
    toggleTheme,
    setTheme,
    getCSSVariable,
  }
}

export default useTheme
