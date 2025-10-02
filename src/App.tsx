import { useState, useEffect } from 'react'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css'

import AdminPage from '@components/AdminPage'
import DebugBanner from '@components/DebugBanner'
import ErrorBoundary from '@components/ErrorBoundary'
import AuthModal from '@components/modals/AuthModal'
import SettingsModal from '@components/modals/SettingsModal'
import ConstdogtutionTab from '@components/tabs/ConstdogtutionTab'
import FeedTab from '@components/tabs/FeedTab'
import JournalTab from '@components/tabs/JournalTab'
import LeaderboardTab from '@components/tabs/LeaderboardTab'
import LogTab from '@components/tabs/LogTab'
import { STORAGE_KEYS, UI_TEXT, CONFIG, TAB_TYPES } from '@constants'
import { AuthProvider } from '@contexts/AuthContext'
import { useAuth } from '@hooks/useAuth'
import useContestCountdown from '@hooks/useContestCountdown'
import useContestDataV2 from '@hooks/useContestDataV2'
import useContestLeader from '@hooks/useContestLeader'
import useContests from '@hooks/useContests'
import { useDataService } from '@hooks/useDataService'
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
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>(
    'signup'
  )
  const { currentUser, logout } = useAuth()
  const { activeContest } = useContests()

  const currentUserId = currentUser?.uid
  const activeContestId = activeContest?.id

  const {
    contestPosts,
    users,
    addPost,
    editPost,
    isLoading,
    error,
    hasMorePosts,
    isLoadingMore,
    loadMorePosts,
  } = useContestDataV2(currentUserId, activeContestId)

  // Get reaction methods from data service
  const { togglePostReaction, togglePostFlag } = useDataService()

  // Reaction handlers
  const handleToggleReaction = (postId: string, emoji: string) => {
    if (currentUserId) {
      void togglePostReaction(postId, currentUserId, emoji)
    }
  }

  const handleToggleFlag = (postId: string) => {
    if (currentUserId) {
      void togglePostFlag(postId, currentUserId)
    }
  }

  // Contest info hooks (depend on loaded data)
  const countdown = useContestCountdown(activeContest)
  const { leader, isTied, tiedCount } = useContestLeader(users || [])

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
        return <LeaderboardTab users={users} currentUserId={currentUserId} />
      case TAB_TYPES.FEED:
        return (
          <FeedTab
            posts={contestPosts}
            onEditPost={editPost}
            currentUserId={currentUserId!}
            hasMorePosts={hasMorePosts}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMorePosts}
            onToggleReaction={handleToggleReaction}
            onToggleFlag={handleToggleFlag}
            isAuthenticated={!!currentUser}
          />
        )
      case TAB_TYPES.LOG:
        return (
          <LogTab
            onAddPost={addPost}
            setActiveTab={setActiveTab}
            isContestOver={countdown.isContestOver}
          />
        )
      case TAB_TYPES.JOURNAL:
        return (
          <JournalTab
            posts={contestPosts}
            currentUserId={currentUserId!}
            onEditPost={editPost}
          />
        )
      case TAB_TYPES.CONSTDOGTUTION:
        return <ConstdogtutionTab />
      default:
        return <LeaderboardTab users={users} currentUserId={currentUserId} />
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
      // Show only top 10 users for guests
      const top10Users = users.slice(0, 10)

      return (
        <div className="guest-content">
          <div className="join-contest-banner">
            <h2>🌭 Hot Dog League</h2>
            <p>See who's leading the competition!</p>
            <div className="auth-buttons">
              <button
                className="join-contest-btn"
                onClick={() => {
                  setAuthModalMode('signup')
                  setShowAuthModal(true)
                }}
              >
                🏆 Join
              </button>
              <button
                className="sign-in-btn"
                onClick={() => {
                  setAuthModalMode('signin')
                  setShowAuthModal(true)
                }}
              >
                🔑 Sign In
              </button>
            </div>
          </div>
          <main className="tab-content guest-leaderboard">
            <h2 className="guest-leaderboard-title">
              {UI_TEXT.TABS.LEADERBOARD}
            </h2>
            {activeContest && (
              <div className="guest-countdown-section">
                <div className="guest-countdown-info">
                  <span className="countdown-label">
                    {countdown.statusMessage}
                  </span>
                  {!countdown.isCompleted && (
                    <span className="countdown-time">
                      {countdown.formattedTime}
                    </span>
                  )}
                  {countdown.isContestOver && leader && (
                    <span className="contest-winner">
                      Contest Winner: {leader.displayName}!
                    </span>
                  )}
                </div>
              </div>
            )}
            <LeaderboardTab users={top10Users} currentUserId={currentUserId} />
            <ConstdogtutionTab />
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
          <button
            className={`tab-button ${activeTab === TAB_TYPES.CONSTDOGTUTION ? 'active' : ''}`}
            onClick={() => setActiveTab(TAB_TYPES.CONSTDOGTUTION)}
          >
            {UI_TEXT.TABS.CONSTDOGTUTION}
          </button>
        </nav>

        <main className="tab-content">{renderTabContent()}</main>
      </>
    )
  }

  /**
   * Renders the header content with app title and settings button.
   * Separate layouts for mobile vs desktop/tablet
   *
   * @returns {JSX.Element} The header content with title and settings access
   */
  const getHeaderContent = () => {
    return (
      <>
        {/* Mobile Header Layout (3-4 rows) */}
        <div className="header-content mobile-header">
          {/* Row 1: App title + User authentication */}
          <div className="header-row header-row-1">
            <div className="title-section">
              <h1>{UI_TEXT.APP_TITLE}</h1>
            </div>
            <div className="header-actions">
              {currentUser && (
                <div className="user-info">
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

          {/* Row 3: Current leader + Contest countdown timer */}
          {activeContest && (
            <div className="header-row header-row-3">
              <div className="leader-section">
                {leader && (
                  <div className="leader-info">
                    <span className="leader-label">
                      {isTied ? `${tiedCount}-way tie:` : 'Leader:'}
                    </span>
                    <span className="leader-name">
                      {leader.displayName} ({leader.contestCount})
                    </span>
                  </div>
                )}
              </div>
              <div className="countdown-section">
                <div className="countdown-info">
                  <span className="countdown-label">
                    {countdown.statusMessage}
                  </span>
                  {!countdown.isCompleted && (
                    <span className="countdown-time">
                      {countdown.formattedTime}
                    </span>
                  )}
                  {countdown.isContestOver && leader && (
                    <span className="contest-winner">
                      Contest Winner: {leader.displayName}!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop/Tablet Header Layout (single row) */}
        <div className="header-content desktop-header">
          <div className="desktop-left-section">
            {/* Empty left section for balance */}
          </div>

          <div className="desktop-center-section">
            <h1>{UI_TEXT.APP_TITLE}</h1>
            {activeContest && (
              <div className="contest-info-combined">
                {leader && (
                  <div className="leader-info">
                    <span className="leader-label">
                      {isTied ? `${tiedCount}-way tie:` : 'Leader:'}
                    </span>
                    <span className="leader-name">
                      {leader.displayName} ({leader.contestCount})
                    </span>
                  </div>
                )}
                <div className="countdown-info">
                  <span className="countdown-label">
                    {countdown.statusMessage}
                  </span>
                  {!countdown.isCompleted && (
                    <span className="countdown-time">
                      {countdown.formattedTime}
                    </span>
                  )}
                  {countdown.isContestOver && leader && (
                    <span className="contest-winner">
                      Contest Winner: {leader.displayName}!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="desktop-right-section">
            {currentUser && (
              <div className="user-info">
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
      </>
    )
  }

  return (
    <div className={`app ${!currentUser ? 'guest-mode' : ''}`}>
      <DebugBanner />

      {!isLoading && currentUser && (
        <header className="app-header">{getHeaderContent()}</header>
      )}

      <ErrorBoundary>{renderContent()}</ErrorBoundary>

      {showSettingsModal && (
        <ErrorBoundary>
          <SettingsModal
            onClose={() => setShowSettingsModal(false)}
            onClearData={handleClearAllData}
          />
        </ErrorBoundary>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
