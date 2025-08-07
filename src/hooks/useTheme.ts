import { useEffect } from 'react'
import { applyTheme, getCSSVariable, type ThemeMode } from '../constants/theme'
import useLocalStorage from './useLocalStorage'
import { STORAGE_KEYS } from '../constants'

interface UseThemeReturn {
  isDarkMode: boolean
  theme: ThemeMode
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  getCSSVariable: (variableName: string) => string
}

function useTheme(): UseThemeReturn {
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(STORAGE_KEYS.DARK_MODE, false)
  
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
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }
  
  const setTheme = (newTheme: ThemeMode) => {
    setIsDarkMode(newTheme === 'dark')
  }
  
  return {
    isDarkMode,
    theme,
    toggleTheme,
    setTheme,
    getCSSVariable
  }
}

export default useTheme