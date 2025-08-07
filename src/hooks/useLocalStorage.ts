import { useState, useEffect } from 'react'

/**
 * Custom hook for managing state that persists to localStorage.
 * Automatically syncs state changes with localStorage and handles JSON serialization.
 * Provides error handling for corrupted localStorage data.
 * 
 * @template T - The type of the stored value
 * @param {string} key - The localStorage key to use
 * @param {T} defaultValue - The default value to use if no stored value exists
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} A tuple containing the current value and setter function
 */
function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state with localStorage value or default
  const [value, setValue] = useState<T>(() => {
    try {
      const savedValue = localStorage.getItem(key)
      return savedValue ? JSON.parse(savedValue) : defaultValue
    } catch (error) {
      console.error(`Error parsing localStorage value for key "${key}":`, error)
      return defaultValue
    }
  })
  
  // Save data to localStorage whenever value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }, [key, value])
  
  return [value, setValue]
}

export default useLocalStorage