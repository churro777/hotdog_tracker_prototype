import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import './index.css'
import { perf } from '@config/firebase'
import { applyTheme, type ThemeName } from '@constants/theme'
import { validateEnvironment } from '@utils/env'

import App from './App.tsx'

// Apply stored theme CSS variables to complement the HTML head initialization
const initializeThemeVariables = () => {
  try {
    // Check for stored theme (new system)
    const storedThemeRaw = localStorage.getItem('theme')

    if (storedThemeRaw) {
      // Parse JSON since useLocalStorage stores values as JSON
      const storedTheme = JSON.parse(storedThemeRaw) as ThemeName
      applyTheme(storedTheme)
      return
    }

    // Fallback to old dark mode setting
    const storedDarkMode = localStorage.getItem('darkMode')

    if (storedDarkMode) {
      const isDarkMode = JSON.parse(storedDarkMode) as boolean
      const theme = isDarkMode ? 'dark' : 'light'
      applyTheme(theme)
      return
    }

    // Default to light theme
    applyTheme('light')
  } catch (error) {
    console.warn(
      'Failed to initialize theme variables, using default light theme:',
      error
    )
    applyTheme('light')
  }
}

// Initialize theme variables before React renders
initializeThemeVariables()

// Validate environment variables on startup
validateEnvironment()

// Initialize Firebase Performance Monitoring
// This automatically tracks page loads, HTTP requests, and custom metrics
console.log('🔥 Firebase Performance Monitoring initialized:', perf)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
