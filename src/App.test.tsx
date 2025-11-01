import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@test/test-utils'

import App from './App'

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as object),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    Routes: ({ children }: { children: React.ReactNode }) => {
      // Return the first route (main app content) for testing
      if (Array.isArray(children)) {
        return children[0] as React.ReactNode
      }
      return children
    },
    Route: ({ element }: { element: React.ReactNode }) => element,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      to?: string
      className?: string
    }) => (
      <a href={props.to} className={props.className}>
        {children}
      </a>
    ),
  }
})

// Mock Firebase config
vi.mock('@config/firebase', () => ({
  auth: {},
  db: {},
}))

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback: (user: any) => void) => {
    // Simulate authenticated user
    callback({
      uid: '1',
      email: 'test@example.com',
      displayName: 'Test User',
    })
    return vi.fn() // unsubscribe function
  }),
  updateProfile: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  TwitterAuthProvider: vi.fn(),
  OAuthProvider: vi.fn(),
}))

// Mock Firebase firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => ({
    exists: () => false,
  })),
}))

// Mock useAuth hook
vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    currentUser: {
      uid: '1',
      email: 'test@example.com',
      displayName: 'Test User',
    },
    loading: false,
    signup: vi.fn(),
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithTwitter: vi.fn(),
    loginWithApple: vi.fn(),
    logout: vi.fn(),
  }),
}))

// Mock all the hooks with simple implementations
vi.mock('@hooks/useContestDataV2', () => ({
  default: () => ({
    contestPosts: [],
    users: [
      {
        id: '1',
        email: 'test@example.com',
        displayName: 'You',
        totalCount: 5,
        createdAt: new Date('2024-01-01'),
        lastActive: new Date('2024-01-02'),
      },
      {
        id: '2',
        email: 'joey@example.com',
        displayName: 'Joey Chestnut',
        totalCount: 23,
        createdAt: new Date('2024-01-01'),
        lastActive: new Date('2024-01-02'),
      },
    ],
    isLoading: false,
    error: null,
    addPost: vi.fn(),
    editPost: vi.fn(),
    refreshData: vi.fn(),
    getCurrentUserStats: () => null,
    allPosts: [],
    allUsers: [],
  }),
}))

vi.mock('@hooks/useTheme', () => ({
  default: () => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
  }),
}))

describe('App Component - Basic Integration', () => {
  it('should render app title', () => {
    render(<App />)
    expect(screen.getAllByText('Hot Dog League')).toHaveLength(2) // Mobile and desktop headers
  })

  it('should render navigation tabs', () => {
    render(<App />)

    // Find buttons by their role, not by duplicate text
    const buttons = screen.getAllByRole('button')
    const tabTexts = buttons
      .map(btn => btn.textContent)
      .filter(
        text =>
          (text?.includes('🏆') ?? false) ||
          (text?.includes('📰') ?? false) ||
          (text?.includes('📝') ?? false) ||
          (text?.includes('📔') ?? false)
      )

    // Note: Log tab (📝) is hidden when there's no active contest or contest is not active
    // With no active contest mocked, we expect 3 tabs: Leaderboard, Feed, Journal
    expect(tabTexts).toHaveLength(3)
  })

  it('should render settings button', () => {
    render(<App />)
    expect(screen.getAllByText('⚙️')).toHaveLength(2) // Mobile and desktop headers
  })

  it('should have proper app structure', () => {
    render(<App />)

    // Check for main structural elements
    expect(document.querySelector('.app')).toBeInTheDocument()
    expect(document.querySelector('.app-header')).toBeInTheDocument()
    expect(document.querySelector('.tab-nav')).toBeInTheDocument()
    expect(document.querySelector('.tab-content')).toBeInTheDocument()
  })

  it('should render some leaderboard content by default', () => {
    render(<App />)

    // Should show some user names from the mocked data
    expect(screen.getByText('Joey Chestnut')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })
})
