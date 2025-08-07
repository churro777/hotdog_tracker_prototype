import { useState, useEffect } from 'react'

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