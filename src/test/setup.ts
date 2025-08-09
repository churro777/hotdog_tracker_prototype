import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock localStorage for tests
export const localStorageMock = {
  getItem: vi.fn<(key: string) => string | null>(),
  setItem: vi.fn<(key: string, value: string) => void>(),
  removeItem: vi.fn<(key: string) => void>(),
  clear: vi.fn<() => void>(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    reload: vi.fn<() => void>(),
  },
  writable: true,
})

// Mock window.alert for tests
Object.defineProperty(window, 'alert', {
  value: vi.fn<(message: string) => void>(),
  writable: true,
})

// Mock window.confirm for tests
Object.defineProperty(window, 'confirm', {
  value: vi.fn<(message: string) => boolean>(() => true),
  writable: true,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // Reset localStorage mocks to return null (no stored values)
  localStorageMock.getItem.mockReturnValue(null)
})
