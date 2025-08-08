import '@testing-library/jest-dom'

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    reload: vi.fn(),
  },
  writable: true,
})

// Mock window.alert for tests
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
})

// Mock window.confirm for tests
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // Reset localStorage mocks to return null (no stored values)
  localStorageMock.getItem.mockReturnValue(null)
})
