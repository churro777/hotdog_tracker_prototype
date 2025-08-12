import { useState, useEffect } from 'react'

import './App.css'

import ErrorBoundary from '@components/ErrorBoundary'
import AuthModal from '@components/modals/AuthModal'
import SettingsModal from '@components/modals/SettingsModal'
import FeedTab from '@components/tabs/FeedTab'
import JournalTab from '@components/tabs/JournalTab'
import LeaderboardTab from '@components/tabs/LeaderboardTab'
import LogTab from '@components/tabs/LogTab'
import {
  STORAGE_KEYS,
  CONTEST_IDS,
  UI_TEXT,
  CONFIG,
  TAB_TYPES,
} from '@constants'
import { AuthProvider } from '@contexts/AuthContext'
import { useAuth } from '@hooks/useAuth'
import useContestDataV2 from '@hooks/useContestDataV2'
import useTheme from '@hooks/useTheme'
import type { Tab } from '@types'

/**
 * Main App component that manages the hot dog contest tracking application.
 * Provides tab-based navigation between leaderboard, feed, logging, and journal views.
 * Handles theme management, settings modal, and data persistence.
 *
 * @returns {JSX.Element} The main application component
 */
function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false)
  const { isDarkMode, toggleTheme } = useTheme()
  const { currentUser, logout } = useAuth()

  const currentUserId = currentUser?.uid
  const contestId = CONTEST_IDS.DEFAULT

  const { contestPosts, contestUsers, addPost, editPost, isLoading, error } =
    useContestDataV2(contestId, currentUserId)

  // Get a random loading message when loading starts
  const [loadingMessage, setLoadingMessage] = useState('')

  useEffect(() => {
    if (isLoading) {
      const messages = UI_TEXT.LOADING_MESSAGES
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)] ?? 'Loading...'
      setLoadingMessage(randomMessage)
    }
  }, [isLoading])

  // Set page title based on environment
  useEffect(() => {
    const isLocal = (CONFIG.DEV_HOSTNAMES as readonly string[]).includes(
      window.location.hostname
    )
    let title: string = UI_TEXT.APP_TITLE

    if (isLocal) {
      title = `${UI_TEXT.DEBUG_PREFIX}${title}`
    }

    document.title = title
  }, [])

  // Theme is now handled by useTheme hook

  /**
   * Handles clearing all application data from localStorage.
   * Removes all stored data including posts, users, and settings,
   * then closes the settings modal and reloads the page for a clean state.
   *
   * @function handleClearAllData
   */
  const handleClearAllData = () => {
    // Clear all localStorage data
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // Close settings modal
    setShowSettingsModal(false)

    // Reload the page to ensure clean state
    window.location.reload()
  }

  /**
   * Renders the appropriate tab content based on the currently active tab.
   *
   * @returns {JSX.Element} The component for the currently active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case TAB_TYPES.LEADERBOARD:
        return (
          <LeaderboardTab contestUsers={contestUsers} isDarkMode={isDarkMode} />
        )
      case TAB_TYPES.FEED:
        return (
          <FeedTab
            posts={contestPosts}
            onEditPost={editPost}
            currentUserId={currentUserId!}
          />
        )
      case TAB_TYPES.LOG:
        return <LogTab onAddPost={addPost} setActiveTab={setActiveTab} />
      case TAB_TYPES.JOURNAL:
        return (
          <JournalTab
            posts={contestPosts}
            currentUserId={currentUserId!}
            onEditPost={editPost}
          />
        )
      default:
        return <LeaderboardTab contestUsers={contestUsers} />
    }
  }

  /**
   * Renders the main content area including tab navigation and active tab content.
   *
   * @returns {JSX.Element} The main content area with navigation and tab content
   */
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-message">{loadingMessage}</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-container">
          <p>Error loading data: {error}</p>
        </div>
      )
    }

    // Guest experience: only show leaderboard with join button
    if (!currentUser) {
      return (
        <div className="guest-content">
          <div className="join-contest-banner">
            <h2>🌭 Hot Dog Eating Contest Leaderboard</h2>
            <p>See who's leading the competition!</p>
            <button
              className="join-contest-btn"
              onClick={() => setShowAuthModal(true)}
            >
              🏆 Join Contest
            </button>
          </div>
          <main className="tab-content">
            <LeaderboardTab
              contestUsers={contestUsers}
              isDarkMode={isDarkMode}
            />
          </main>
        </div>
      )
    }

    // Authenticated user experience: full app with tabs
    return (
      <>
        <nav className="tab-nav">
          <button
            className={`tab-button ${activeTab === TAB_TYPES.LEADERBOARD ? 'active' : ''}`}
            onClick={() => setActiveTab(TAB_TYPES.LEADERBOARD)}
          >
            {UI_TEXT.TABS.LEADERBOARD}
          </button>
          <button
            className={`tab-button ${activeTab === TAB_TYPES.FEED ? 'active' : ''}`}
            onClick={() => setActiveTab(TAB_TYPES.FEED)}
          >
            {UI_TEXT.TABS.FEED}
          </button>
          <button
            className={`tab-button ${activeTab === TAB_TYPES.LOG ? 'active' : ''}`}
            onClick={() => setActiveTab(TAB_TYPES.LOG)}
          >
            {UI_TEXT.TABS.LOG}
          </button>
          <button
            className={`tab-button ${activeTab === TAB_TYPES.JOURNAL ? 'active' : ''}`}
            onClick={() => setActiveTab(TAB_TYPES.JOURNAL)}
          >
            {UI_TEXT.TABS.JOURNAL}
          </button>
        </nav>

        <main className="tab-content">{renderTabContent()}</main>
      </>
    )
  }

  /**
   * Renders the header content with app title and settings button.
   *
   * @returns {JSX.Element} The header content with title and settings access
   */
  const getHeaderContent = () => {
    return (
      <div className="header-content">
        <h1>{UI_TEXT.APP_TITLE}</h1>
        <div className="header-actions">
          {currentUser && (
            <div className="user-info">
              <span className="user-greeting">
                Signed in as {currentUser.displayName ?? 'User'}
              </span>
              <button
                className="settings-btn"
                onClick={() => setShowSettingsModal(true)}
              >
                {UI_TEXT.TABS.SETTINGS}
              </button>
              <button
                className="logout-btn"
                onClick={() => {
                  void logout()
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`app ${!currentUser ? 'guest-mode' : ''}`}>
      {!isLoading && (
        <header className="app-header">{getHeaderContent()}</header>
      )}

      <ErrorBoundary>{renderContent()}</ErrorBoundary>

      {showSettingsModal && (
        <ErrorBoundary>
          <SettingsModal
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
            onClose={() => setShowSettingsModal(false)}
            onClearData={handleClearAllData}
          />
        </ErrorBoundary>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
