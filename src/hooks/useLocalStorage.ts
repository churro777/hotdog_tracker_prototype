import { useState, useEffect } from 'react'

function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue)
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedValue = localStorage.getItem(key)
    if (savedValue) {
      try {
        const parsedValue = JSON.parse(savedValue)
        setValue(parsedValue)
      } catch (error) {
        console.error(`Error parsing localStorage value for key "${key}":`, error)
        setValue(defaultValue)
      }
    } else {
      setValue(defaultValue)
    }
  }, [key, defaultValue])
  
  // Save data to localStorage whenever value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }, [key, value])
  
  return [value, setValue]
}

export default useLocalStorage