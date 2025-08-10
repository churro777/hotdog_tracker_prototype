import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock environment variables for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_APP_NAME: 'Hot Dog Tracker',
    VITE_APP_VERSION: '0.0.0',
    VITE_APP_ENVIRONMENT: 'test',
    VITE_DEV_MODE: 'false',
    VITE_DEBUG_ENABLED: 'false',
    VITE_ENABLE_ANALYTICS: 'false',
    VITE_ENABLE_ERROR_REPORTING: 'false',
    VITE_USE_FIREBASE: 'false',
    VITE_FIREBASE_USE_EMULATOR: 'false',
    ...import.meta.env,
  },
  writable: true,
})

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
