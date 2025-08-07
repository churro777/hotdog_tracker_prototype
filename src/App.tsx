import { useState, useEffect } from 'react'
import './App.css'
import LeaderboardTab from './components/tabs/LeaderboardTab'
import FeedTab from './components/tabs/FeedTab'
import LogTab from './components/tabs/LogTab'
import JournalTab from './components/tabs/JournalTab'
import SettingsModal from './components/modals/SettingsModal'
import type { Tab } from './types'
import useLocalStorage from './hooks/useLocalStorage'
import useContestData from './hooks/useContestData'


function App() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('hotdog-contest-dark-mode', false)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  
  const currentUserId = '1' // This would come from auth in a real app
  const contestId = 'hotdog-contest' // Fixed contest ID
  
  const { contestPosts, contestUsers, addPost, editPost } = useContestData(contestId, currentUserId)


  // Set page title based on environment
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    let title = '🌭 Hot Dog Contest'
    
    if (isLocal) {
      title = `DEBUG - ${title}`
    }
    
    document.title = title
  }, [])

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])





  const handleClearAllData = () => {
    // Clear all localStorage data
    localStorage.removeItem('hotdog-contest-users')
    localStorage.removeItem('hotdog-contest-posts')
    localStorage.removeItem('hotdog-contest-contest-users')
    localStorage.removeItem('hotdog-contest-dark-mode')

    // Close settings modal
    setShowSettingsModal(false)
    
    // Reload the page to ensure clean state
    window.location.reload()
  }


  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return <LeaderboardTab contestUsers={contestUsers} />
      case 'feed':
        return <FeedTab 
          posts={contestPosts} 
          onEditPost={editPost} 
          currentUserId={currentUserId} 
        />
      case 'log':
        return <LogTab 
          onAddPost={addPost}
          setActiveTab={setActiveTab}
        />
      case 'journal':
        return <JournalTab 
          posts={contestPosts} 
          currentUserId={currentUserId} 
          onEditPost={editPost} 
        />
      default:
        return <LeaderboardTab contestUsers={contestUsers} />
    }
  }

  const renderContent = () => {
    return (
      <>
        <nav className="tab-nav">
          <button 
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏆 Leaderboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            📰 Feed
          </button>
          <button 
            className={`tab-button ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            📝 Log
          </button>
          <button 
            className={`tab-button ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            📔 Journal
          </button>
        </nav>

        <main className="tab-content">
          {renderTabContent()}
        </main>
      </>
    )
  }

  const getHeaderContent = () => {
    return (
      <div className="header-content">
        <h1>🌭 Hot Dog Contest</h1>
        <button 
          className="settings-btn"
          onClick={() => setShowSettingsModal(true)}
        >
          ⚙️
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        {getHeaderContent()}
      </header>
      
      {renderContent()}
      
      
      {showSettingsModal && (
        <SettingsModal 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onClose={() => setShowSettingsModal(false)}
          onClearData={handleClearAllData}
        />
      )}
    </div>
  )
}









export default App
