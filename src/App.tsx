import { useState, useEffect } from 'react'
import './App.css'

type Tab = 'leaderboard' | 'chat' | 'log' | 'journal' | 'settings'

type User = {
  id: string
  name: string
  totalHotDogs: number
  avatar?: string
}

type HotDogPost = {
  id: string
  userId: string
  userName: string
  count: number
  image?: string
  timestamp: Date
  description?: string
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<HotDogPost[]>([])

  const defaultUsers: User[] = [
    { id: '1', name: 'Joey Chestnut', totalHotDogs: 23 },
    { id: '2', name: 'Takeru Kobayashi', totalHotDogs: 18 },
    { id: '3', name: 'Matt Stonie', totalHotDogs: 15 },
    { id: '4', name: 'You', totalHotDogs: 3 },
    { id: '5', name: 'Your Friend', totalHotDogs: 7 }
  ]

  const defaultPosts: HotDogPost[] = [
    {
      id: '1', 
      userId: '1', 
      userName: 'Joey Chestnut', 
      count: 5, 
      timestamp: new Date(), 
      description: 'Just crushed 5 more! 🌭'
    }
  ]

  useEffect(() => {
    const savedUsers = localStorage.getItem('hotdog-contest-users')
    const savedPosts = localStorage.getItem('hotdog-contest-posts')
    
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers)
        setUsers(parsedUsers)
      } catch (error) {
        console.error('Error parsing users from localStorage:', error)
        setUsers(defaultUsers)
      }
    } else {
      setUsers(defaultUsers)
    }

    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts)
        const postsWithDates = parsedPosts.map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }))
        setPosts(postsWithDates)
      } catch (error) {
        console.error('Error parsing posts from localStorage:', error)
        setPosts(defaultPosts)
      }
    } else {
      setPosts(defaultPosts)
    }
  }, [])

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('hotdog-contest-users', JSON.stringify(users))
    }
  }, [users])

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('hotdog-contest-posts', JSON.stringify(posts))
    }
  }, [posts])

  // Set page title based on environment
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const title = isLocal 
      ? 'DEBUG - The Board - Hot Dog Contest July 2025'
      : 'The Board - Hot Dog Contest July 2025'
    document.title = title
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leaderboard':
        return <LeaderboardTab users={users} />
      case 'chat':
        return <ChatTab posts={posts} />
      case 'log':
        return <LogHotDogsTab setPosts={setPosts} users={users} setUsers={setUsers} setActiveTab={setActiveTab} />
      case 'journal':
        return <JournalTab posts={posts} currentUserId="4" />
      case 'settings':
        return <SettingsTab onClearData={() => {
          localStorage.removeItem('hotdog-contest-users')
          localStorage.removeItem('hotdog-contest-posts')
          setUsers(defaultUsers)
          setPosts(defaultPosts)
        }} />
      default:
        return <LeaderboardTab users={users} />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌭 Hot Dog Contest</h1>
      </header>
      
      <nav className="tab-nav">
        <button 
          className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button 
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          📰 Feed
        </button>
        <button 
          className={`tab-button ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          🌭 Log Hot Dogs
        </button>
        <button 
          className={`tab-button ${activeTab === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveTab('journal')}
        >
          📔 Journal
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main className="tab-content">
        {renderTabContent()}
      </main>
    </div>
  )
}

function LeaderboardTab({ users }: { users: User[] }) {
  const sortedUsers = [...users].sort((a, b) => b.totalHotDogs - a.totalHotDogs)

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'  
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  return (
    <div className="tab-panel">
      <h2>🏆 Leaderboard</h2>
      <div className="leaderboard">
        {sortedUsers.map((user, index) => {
          const rank = index + 1
          return (
            <div key={user.id} className={`leaderboard-item ${rank <= 3 ? 'top-three' : ''}`}>
              <div className="rank">
                {getRankEmoji(rank)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-score">{user.totalHotDogs} hot dogs</div>
              </div>
              <div className="hot-dog-count">
                🌭 {user.totalHotDogs}
              </div>
            </div>
          )
        })}
      </div>
      {sortedUsers.length === 0 && (
        <p className="empty-state">No contestants yet! Start posting your hot dogs to get on the leaderboard.</p>
      )}
    </div>
  )
}

function LogHotDogsTab({ setPosts, users, setUsers, setActiveTab }: { 
  setPosts: React.Dispatch<React.SetStateAction<HotDogPost[]>>,
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
}) {
  const [newPostCount, setNewPostCount] = useState<number>(1)
  const [newPostDescription, setNewPostDescription] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    
    const currentUserId = '4'
    const currentUser = users.find(u => u.id === currentUserId)
    
    if (!currentUser) return

    const newPost: HotDogPost = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUser.name,
      count: newPostCount,
      image: imagePreview || undefined,
      timestamp: new Date(),
      description: newPostDescription || undefined
    }

    setPosts(prev => [newPost, ...prev])
    
    setUsers(prev => prev.map(user => 
      user.id === currentUserId 
        ? { ...user, totalHotDogs: user.totalHotDogs + newPostCount }
        : user
    ))

    setNewPostCount(1)
    setNewPostDescription('')
    setImagePreview(null)
    
    const fileInput = document.getElementById('log-image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    
    // Switch to Feed tab to show the new post
    setActiveTab('chat')
  }

  return (
    <div className="tab-panel">
      <h2>🌭 Log Your Hot Dogs</h2>
      
      <form onSubmit={handleSubmitPost} className="post-form">
        <div className="form-section">
          <label htmlFor="log-image-upload" className="image-upload-label">
            📷 Upload Hot Dog Picture (Optional)
          </label>
          <input
            id="log-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="image-upload-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Hot dog preview" />
              <button 
                type="button" 
                onClick={() => setImagePreview(null)}
                className="remove-image"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <label htmlFor="log-count">Hot Dogs Eaten</label>
          <input
            id="log-count"
            type="number"
            min="1"
            max="50"
            value={newPostCount}
            onChange={(e) => setNewPostCount(parseInt(e.target.value) || 1)}
            className="count-input"
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="log-description">Description (Optional)</label>
          <textarea
            id="log-description"
            value={newPostDescription}
            onChange={(e) => setNewPostDescription(e.target.value)}
            placeholder="How was it? Any comments?"
            className="description-input"
            rows={3}
          />
        </div>

        <button type="submit" className="submit-button">
          🌭 Log Hot Dogs
        </button>
      </form>
    </div>
  )
}

function ChatTab({ posts }: { 
  posts: HotDogPost[]
}) {
  return (
    <div className="tab-panel">
      <h2>📰 Hot Dog Feed</h2>
      
      <div className="posts-section">
        <div className="posts-list">
          {posts.map(post => (
            <div key={post.id} className="post-item">
              <div className="post-header">
                <div className="post-user">{post.userName}</div>
                <div className="post-timestamp">
                  {post.timestamp.toLocaleDateString()} {post.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt="Hot dog" />
                </div>
              )}
              
              <div className="post-content">
                <div className="post-count">
                  🌭 <strong>{post.count}</strong> hot dog{post.count !== 1 ? 's' : ''} eaten!
                </div>
                {post.description && (
                  <div className="post-description">{post.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {posts.length === 0 && (
          <p className="empty-state">No posts yet! Head to the "Log Hot Dogs" tab to start sharing your hot dog conquests.</p>
        )}
      </div>
    </div>
  )
}

function JournalTab({ posts, currentUserId }: { posts: HotDogPost[], currentUserId: string }) {
  const userPosts = posts.filter(post => post.userId === currentUserId)
  const totalHotDogs = userPosts.reduce((sum, post) => sum + post.count, 0)
  const averagePerPost = userPosts.length > 0 ? (totalHotDogs / userPosts.length).toFixed(1) : 0
  const bestDay = userPosts.length > 0 ? Math.max(...userPosts.map(post => post.count)) : 0

  const groupedByDate = userPosts.reduce((groups: { [key: string]: HotDogPost[] }, post) => {
    const date = post.timestamp.toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(post)
    return groups
  }, {})

  return (
    <div className="tab-panel">
      <h2>📔 My Hot Dog Journal</h2>
      
      <div className="journal-stats">
        <div className="stat-card">
          <div className="stat-number">{totalHotDogs}</div>
          <div className="stat-label">Total Hot Dogs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userPosts.length}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{averagePerPost}</div>
          <div className="stat-label">Avg per Post</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{bestDay}</div>
          <div className="stat-label">Best Single Post</div>
        </div>
      </div>

      <div className="journal-entries">
        {Object.entries(groupedByDate)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([date, dayPosts]) => {
            const dayTotal = dayPosts.reduce((sum, post) => sum + post.count, 0)
            return (
              <div key={date} className="journal-day">
                <div className="day-header">
                  <h3>{date}</h3>
                  <div className="day-total">🌭 {dayTotal} total</div>
                </div>
                <div className="day-posts">
                  {dayPosts
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map(post => (
                      <div key={post.id} className="journal-post">
                        <div className="journal-post-header">
                          <div className="journal-post-time">
                            {post.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="journal-post-count">
                            🌭 {post.count}
                          </div>
                        </div>
                        
                        {post.image && (
                          <div className="journal-post-image">
                            <img src={post.image} alt="Hot dog" />
                          </div>
                        )}
                        
                        {post.description && (
                          <div className="journal-post-description">
                            {post.description}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
      </div>
      
      {userPosts.length === 0 && (
        <div className="empty-state">
          <p>No hot dogs logged yet! Head over to the Chat tab to start posting your hot dog conquests.</p>
        </div>
      )}
    </div>
  )
}

function SettingsTab({ onClearData }: { onClearData: () => void }) {
  const [userName, setUserName] = useState('You')
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSaveSettings = () => {
    alert('Settings saved! (This is just a prototype)')
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      onClearData()
      alert('All data has been cleared and reset to defaults!')
    }
  }

  return (
    <div className="tab-panel">
      <h2>⚙️ Settings</h2>
      
      <div className="settings-sections">
        <div className="settings-section">
          <h3>Profile</h3>
          <div className="setting-item">
            <label htmlFor="username">Display Name</label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="settings-input"
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Preferences</h3>
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="checkmark"></span>
              Enable notifications for new posts
            </label>
          </div>
          
          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="checkmark"></span>
              Dark mode (coming soon)
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3>Data</h3>
          <div className="setting-item">
            <p className="setting-description">
              Export your hot dog eating data or clear all stored information.
            </p>
            <div className="setting-buttons">
              <button className="settings-button secondary" onClick={() => alert('Export feature coming soon!')}>
                📥 Export Data
              </button>
              <button className="settings-button danger" onClick={handleClearData}>
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>About</h3>
          <div className="setting-item">
            <p className="setting-description">
              Hot Dog Contest App v1.0.0<br/>
              Built with React and TypeScript<br/>
              Made for friendly hot dog eating competitions
            </p>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="settings-button primary" onClick={handleSaveSettings}>
          💾 Save Settings
        </button>
      </div>
    </div>
  )
}

export default App
