import { useState, useEffect } from 'react'

import { logStorageError } from '@utils/errorLogger'

interface LocalStorageChangeDetail {
  key: string
  value: unknown
}

/**
 * Custom hook for managing state that persists to localStorage.
 * Automatically syncs state changes with localStorage and handles JSON serialization.
 * Provides error handling for corrupted localStorage data.
 * Listens for localStorage changes from other components for real-time sync.
 *
 * @template T - The type of the stored value
 * @param {string} key - The localStorage key to use
 * @param {T} defaultValue - The default value to use if no stored value exists
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A tuple containing the current value and setter function
 */
function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state with localStorage value or default
  const [value, setValue] = useState<T>(() => {
    try {
      const savedValue = localStorage.getItem(key)
      return savedValue ? (JSON.parse(savedValue) as T) : defaultValue
    } catch (error) {
      logStorageError(
        `Error parsing localStorage value for key "${key}"`,
        error as Error,
        key
      )
      return defaultValue
    }
  })

  // Save data to localStorage whenever value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        // Dispatch custom event for cross-component sync
        window.dispatchEvent(
          new CustomEvent('localStorageChange', {
            detail: { key, value },
          })
        )
      } catch (error) {
        logStorageError(
          `Error saving to localStorage for key "${key}"`,
          error as Error,
          key
        )
        // In a real app, you might want to show a notification to the user
        // or retry the operation, but for now we'll just log the error
      }
    }
  }, [key, value])

  // Listen for localStorage changes from other components
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      // Type guard to ensure we have the expected detail structure
      if (
        e.detail &&
        typeof e.detail === 'object' &&
        'key' in e.detail &&
        'value' in e.detail
      ) {
        const detail = e.detail as LocalStorageChangeDetail
        if (detail.key === key) {
          try {
            const newValue = detail.value as T
            setValue(newValue)
          } catch (error) {
            logStorageError(
              `Error syncing localStorage value for key "${key}"`,
              error as Error,
              key
            )
          }
        }
      }
    }

    // Listen for our custom event
    window.addEventListener(
      'localStorageChange',
      handleStorageChange as EventListener
    )

    // Also listen for native storage events (from other tabs)
    const handleNativeStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue) as T
          setValue(newValue)
        } catch (error) {
          logStorageError(
            `Error parsing storage event value for key "${key}"`,
            error as Error,
            key
          )
        }
      }
    }

    window.addEventListener('storage', handleNativeStorageChange)

    return () => {
      window.removeEventListener(
        'localStorageChange',
        handleStorageChange as EventListener
      )
      window.removeEventListener('storage', handleNativeStorageChange)
    }
  }, [key])

  return [value, setValue]
}

export default useLocalStorage
