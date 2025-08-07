import { useState, useEffect } from 'react'
import './App.css'
import LeaderboardTab from './components/tabs/LeaderboardTab'
import FeedTab from './components/tabs/FeedTab'
import LogTab from './components/tabs/LogTab'
import JournalTab from './components/tabs/JournalTab'
import SettingsModal from './components/modals/SettingsModal'

type Tab = 'leaderboard' | 'feed' | 'log' | 'journal'

type User = {
  id: string
  name: string
  avatar?: string
  contacts?: string[] // array of user IDs
}


type ContestPost = {
  id: string
  contestId: string
  userId: string
  userName: string
  count?: number
  image?: string
  timestamp: Date
  description?: string
  type: 'entry' | 'join' | 'invite'
  invitedUsers?: string[] // for invite posts
}

type ContestUser = {
  id: string
  contestId: string
  userId: string
  userName: string
  totalCount: number
}

const defaultUsers: User[] = [
  { id: '1', name: 'You', contacts: ['2', '3', '4', '5', '6', '7', '8'] },
  { id: '2', name: 'Joey Chestnut', contacts: ['1'] },
  { id: '3', name: 'Takeru Kobayashi', contacts: ['1'] },
  { id: '4', name: 'Matt Stonie', contacts: ['1'] },
  { id: '5', name: 'Your Friend', contacts: ['1'] },
  { id: '6', name: 'Sarah Johnson', contacts: ['1'] },
  { id: '7', name: 'Mike Chen', contacts: ['1'] },
  { id: '8', name: 'Emma Wilson', contacts: ['1'] }
]


const defaultContestUsers: ContestUser[] = [
  { id: 'cu-1', contestId: 'hotdog-contest', userId: '2', userName: 'Joey Chestnut', totalCount: 23 },
  { id: 'cu-2', contestId: 'hotdog-contest', userId: '3', userName: 'Takeru Kobayashi', totalCount: 18 },
  { id: 'cu-3', contestId: 'hotdog-contest', userId: '4', userName: 'Matt Stonie', totalCount: 15 },
  { id: 'cu-4', contestId: 'hotdog-contest', userId: '1', userName: 'You', totalCount: 3 },
  { id: 'cu-5', contestId: 'hotdog-contest', userId: '5', userName: 'Your Friend', totalCount: 7 }
]

const defaultContestPosts: ContestPost[] = [
  {
    id: '1',
    contestId: 'hotdog-contest', 
    userId: '2', 
    userName: 'Joey Chestnut', 
    count: 5, 
    timestamp: new Date(), 
    description: 'Just crushed 5 more! 🌭',
    type: 'entry'
  }
]

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  
  const [users, setUsers] = useState<User[]>([])
  const [contestPosts, setContestPosts] = useState<ContestPost[]>([])
  const [contestUsers, setContestUsers] = useState<ContestUser[]>([])
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  
  const currentUserId = '1' // This would come from auth in a real app
  const contestId = 'hotdog-contest' // Fixed contest ID

  useEffect(() => {
    // Load users
    const savedUsers = localStorage.getItem('hotdog-contest-users')
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers))
      } catch (error) {
        console.error('Error parsing users:', error)
        setUsers(defaultUsers)
      }
    } else {
      setUsers(defaultUsers)
    }

    // Load contest posts
    const savedPosts = localStorage.getItem('hotdog-contest-posts')
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts).map((post: ContestPost & { timestamp: string }) => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }))
        setContestPosts(parsedPosts)
      } catch (error) {
        console.error('Error parsing posts:', error)
        setContestPosts(defaultContestPosts)
      }
    } else {
      setContestPosts(defaultContestPosts)
    }

    // Load contest users
    const savedContestUsers = localStorage.getItem('hotdog-contest-contest-users')
    if (savedContestUsers) {
      try {
        setContestUsers(JSON.parse(savedContestUsers))
      } catch (error) {
        console.error('Error parsing contest users:', error)
        setContestUsers(defaultContestUsers)
      }
    } else {
      setContestUsers(defaultContestUsers)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('hotdog-contest-users', JSON.stringify(users))
    }
  }, [users])

  useEffect(() => {
    if (contestPosts.length > 0) {
      localStorage.setItem('hotdog-contest-posts', JSON.stringify(contestPosts))
    }
  }, [contestPosts])

  useEffect(() => {
    if (contestUsers.length > 0) {
      localStorage.setItem('hotdog-contest-contest-users', JSON.stringify(contestUsers))
    }
  }, [contestUsers])

  // Set page title based on environment
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    let title = '🌭 Hot Dog Contest'
    
    if (isLocal) {
      title = `DEBUG - ${title}`
    }
    
    document.title = title
  }, [])

  // Load dark mode setting from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('hotdog-contest-dark-mode')
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true')
    }
  }, [])

  // Save dark mode setting to localStorage and apply to body
  useEffect(() => {
    localStorage.setItem('hotdog-contest-dark-mode', darkMode.toString())
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  const handleEditPost = (postId: string, newCount: number, newDescription?: string) => {
    setContestPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const oldCount = post.count
        const updatedPost = {
          ...post,
          count: newCount,
          description: newDescription
        }
        
        // Update contest user's total count
        setContestUsers(prevUsers => prevUsers.map(user => 
          user.userId === post.userId
            ? { ...user, totalCount: user.totalCount - (oldCount || 0) + newCount }
            : user
        ))
        
        return updatedPost
      }
      return post
    }))
  }




  const handleClearAllData = () => {
    // Clear all localStorage data
    localStorage.removeItem('hotdog-contest-users')
    localStorage.removeItem('hotdog-contest-posts')
    localStorage.removeItem('hotdog-contest-contest-users')
    localStorage.removeItem('hotdog-contest-dark-mode')

    // Reset to default data
    setUsers(defaultUsers)
    setContestPosts(defaultContestPosts)
    setContestUsers(defaultContestUsers)
    setDarkMode(false)
    
    // Close settings modal
    setShowSettingsModal(false)
  }


  const renderTabContent = () => {
    const contestPostsForContest = contestPosts.filter(p => p.contestId === contestId)
    const contestUsersForContest = contestUsers.filter(u => u.contestId === contestId)
    
    switch (activeTab) {
      case 'leaderboard':
        return <LeaderboardTab contestUsers={contestUsersForContest} />
      case 'feed':
        return <FeedTab 
          posts={contestPostsForContest} 
          onEditPost={handleEditPost} 
          currentUserId={currentUserId} 
        />
      case 'log':
        return <LogTab 
          contestId={contestId}
          setContestPosts={setContestPosts} 
          contestUsers={contestUsers}
          setContestUsers={setContestUsers}
          currentUserId={currentUserId}
          setActiveTab={setActiveTab}
        />
      case 'journal':
        return <JournalTab 
          posts={contestPostsForContest} 
          currentUserId={currentUserId} 
          onEditPost={handleEditPost} 
        />
      default:
        return <LeaderboardTab contestUsers={contestUsersForContest} />
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
