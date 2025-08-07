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

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  // Reset localStorage mocks to return null (no stored values)
  localStorageMock.getItem.mockReturnValue(null)
})