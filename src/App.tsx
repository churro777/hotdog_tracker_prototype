import { useState, useEffect } from 'react'
import './App.css'

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


function LeaderboardTab({ contestUsers }: { 
  contestUsers: ContestUser[]
}) {
  const sortedUsers = [...contestUsers].sort((a, b) => b.totalCount - a.totalCount)

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
                <div className="user-name">{user.userName}</div>
                <div className="user-score">{user.totalCount} hot dogs</div>
              </div>
              <div className="hot-dog-count">
                🌭 {user.totalCount}
              </div>
            </div>
          )
        })}
      </div>
      {sortedUsers.length === 0 && (
        <p className="empty-state">No contestants yet! Start logging to get on the leaderboard.</p>
      )}
    </div>
  )
}

function LogTab({ 
  contestId, 
  setContestPosts, 
  contestUsers, 
  setContestUsers, 
  currentUserId, 
  setActiveTab
}: { 
  contestId: string,
  setContestPosts: React.Dispatch<React.SetStateAction<ContestPost[]>>,
  contestUsers: ContestUser[],
  setContestUsers: React.Dispatch<React.SetStateAction<ContestUser[]>>,
  currentUserId: string,
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
}) {
  const [newPostCount, setNewPostCount] = useState<string>('1')
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
    
    const currentContestUser = contestUsers.find(u => u.userId === currentUserId)
    if (!currentContestUser) return

    const newPost: ContestPost = {
      id: Date.now().toString(),
      contestId: contestId,
      userId: currentUserId,
      userName: currentContestUser.userName,
      count: parseInt(newPostCount) || 1,
      image: imagePreview || undefined,
      timestamp: new Date(),
      description: newPostDescription || undefined,
      type: 'entry'
    }

    setContestPosts(prev => [newPost, ...prev])
    
    setContestUsers(prev => prev.map(user => 
      user.userId === currentUserId
        ? { ...user, totalCount: user.totalCount + (parseInt(newPostCount) || 1) }
        : user
    ))

    setNewPostCount('1')
    setNewPostDescription('')
    setImagePreview(null)
    
    const fileInput = document.getElementById('log-image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    
    // Switch to Feed tab to show the new post
    setActiveTab('feed')
  }

  return (
    <div className="tab-panel">
      <h2>📝 Log Entry</h2>
      
      <form onSubmit={handleSubmitPost} className="post-form">
        <div className="form-section">
          <label htmlFor="log-image-upload" className="image-upload-label">
            📷 Upload Picture (Optional)
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
              <img src={imagePreview} alt="Contest item preview" />
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
          <label htmlFor="log-count">Items Consumed</label>
          <input
            id="log-count"
            type="number"
            min="1"
            max="50"
            value={newPostCount}
            onChange={(e) => setNewPostCount(e.target.value)}
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
          📝 Log Entry
        </button>
      </form>
    </div>
  )
}

function FeedTab({ posts, onEditPost, currentUserId }: { 
  posts: ContestPost[],
  onEditPost: (postId: string, newCount: number, newDescription?: string) => void,
  currentUserId: string
}) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editCount, setEditCount] = useState<string>('1')
  const [editDescription, setEditDescription] = useState<string>('')

  const startEditing = (post: ContestPost) => {
    setEditingPostId(post.id)
    setEditCount((post.count || 1).toString())
    setEditDescription(post.description || '')
    
    // Focus and select the input after state updates
    setTimeout(() => {
      const input = document.querySelector('.edit-count-input') as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    }, 0)
  }

  const saveEdit = () => {
    if (editingPostId) {
      const count = parseInt(editCount) || 1
      onEditPost(editingPostId, count, editDescription)
      setEditingPostId(null)
    }
  }

  const cancelEdit = () => {
    setEditingPostId(null)
  }
  const renderPostContent = (post: ContestPost) => {
    if (post.type === 'join') {
      return (
        <div className="post-content join-post">
          <div className="join-notification">
            🎉 <strong>{post.userName}</strong> joined the contest!
          </div>
          {post.description && (
            <div className="post-description">{post.description}</div>
          )}
        </div>
      )
    }

    if (post.type === 'invite') {
      return (
        <div className="post-content invite-post">
          <div className="invite-notification">
            📧 <strong>{post.userName}</strong> invited new participants to the contest
          </div>
          {post.description && (
            <div className="post-description">{post.description}</div>
          )}
        </div>
      )
    }

    // Default entry post
    return (
      <div className="post-content">
        <div className="post-count">
          🌭 <strong>{post.count}</strong> hot dog{post.count !== 1 ? 's' : ''} eaten!
        </div>
        {post.description && (
          <div className="post-description">{post.description}</div>
        )}
      </div>
    )
  }

  return (
    <div className="tab-panel">
      <div className="feed-header">
        <h2>📰 Contest Feed</h2>
      </div>
      
      <div className="posts-section">
        <div className="posts-list">
          {posts.map(post => (
            <div key={post.id} className={`post-item ${post.type}`}>
              {editingPostId === post.id && post.type === 'entry' ? (
                <div className="edit-form">
                  <div className="post-header">
                    <div className="post-user">{post.userName}</div>
                    <div className="edit-controls">
                      <button onClick={saveEdit} className="save-edit-btn">💾</button>
                      <button onClick={cancelEdit} className="cancel-edit-btn">❌</button>
                    </div>
                  </div>
                  
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Contest item" />
                    </div>
                  )}
                  
                  <div className="edit-inputs">
                    <div className="edit-count">
                      <label>Items: </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={editCount}
                        onChange={(e) => setEditCount(e.target.value)}
                        className="edit-count-input"
                      />
                    </div>
                    <div className="edit-description">
                      <label>Description: </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="How was it? Any comments?"
                        className="edit-description-input"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="post-header">
                    <div className="post-user">{post.userName}</div>
                    <div className="post-timestamp-actions">
                      <div className="post-timestamp">
                        {post.timestamp.toLocaleDateString()} {post.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      {post.userId === currentUserId && post.type === 'entry' && (
                        <button onClick={() => startEditing(post)} className="edit-post-btn">✏️</button>
                      )}
                    </div>
                  </div>
                  
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Contest item" />
                    </div>
                  )}
                  
                  {renderPostContent(post)}
                </>
              )}
            </div>
          ))}
        </div>
        
        {posts.length === 0 && (
          <p className="empty-state">No posts yet! Head to the "Log" tab to start sharing your progress.</p>
        )}
      </div>
    </div>
  )
}

function JournalTab({ posts, currentUserId, onEditPost }: { 
  posts: ContestPost[], 
  currentUserId: string,
  onEditPost: (postId: string, newCount: number, newDescription?: string) => void
}) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editCount, setEditCount] = useState<string>('1')
  const [editDescription, setEditDescription] = useState<string>('')

  const userPosts = posts.filter(post => post.userId === currentUserId && post.type === 'entry')
  const totalHotDogs = userPosts.reduce((sum, post) => sum + (post.count || 0), 0)
  const averagePerPost = userPosts.length > 0 ? (totalHotDogs / userPosts.length).toFixed(1) : 0
  const bestDay = userPosts.length > 0 ? Math.max(...userPosts.map(post => post.count || 0)) : 0

  const startEditing = (post: ContestPost) => {
    setEditingPostId(post.id)
    setEditCount((post.count || 1).toString())
    setEditDescription(post.description || '')
    
    // Focus and select the input after state updates
    setTimeout(() => {
      const input = document.querySelector('.edit-count-input') as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    }, 0)
  }

  const saveEdit = () => {
    if (editingPostId) {
      const count = parseInt(editCount) || 1
      onEditPost(editingPostId, count, editDescription)
      setEditingPostId(null)
    }
  }

  const cancelEdit = () => {
    setEditingPostId(null)
  }

  const groupedByDate = userPosts.reduce((groups: { [key: string]: ContestPost[] }, post) => {
    const date = post.timestamp.toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(post)
    return groups
  }, {})

  return (
    <div className="tab-panel">
      <h2>📔 My Journal</h2>
      
      <div className="journal-stats">
        <div className="stat-card">
          <div className="stat-number">{totalHotDogs}</div>
          <div className="stat-label">Total Items</div>
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
            const dayTotal = dayPosts.reduce((sum, post) => sum + (post.count || 0), 0)
            return (
              <div key={date} className="journal-day">
                <div className="day-header">
                  <h3>{date}</h3>
                  <div className="day-total">📝 {dayTotal} total</div>
                </div>
                <div className="day-posts">
                  {dayPosts
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map(post => (
                      <div key={post.id} className="journal-post">
                        {editingPostId === post.id ? (
                          <div className="edit-form">
                            <div className="journal-post-header">
                              <div className="journal-post-time">
                                {post.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              <div className="edit-controls">
                                <button onClick={saveEdit} className="save-edit-btn">💾</button>
                                <button onClick={cancelEdit} className="cancel-edit-btn">❌</button>
                              </div>
                            </div>
                            
                            {post.image && (
                              <div className="journal-post-image">
                                <img src={post.image} alt="Contest item" />
                              </div>
                            )}
                            
                            <div className="edit-inputs">
                              <div className="edit-count">
                                <label>Items: </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={editCount}
                                  onChange={(e) => setEditCount(e.target.value)}
                                  className="edit-count-input"
                                />
                              </div>
                              <div className="edit-description">
                                <label>Description: </label>
                                <textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="How was it? Any comments?"
                                  className="edit-description-input"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="journal-post-header">
                              <div className="journal-post-time">
                                {post.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              <div className="journal-post-actions">
                                <div className="journal-post-count">
                                  📝 {post.count || 0}
                                </div>
                                <button onClick={() => startEditing(post)} className="edit-post-btn">✏️</button>
                              </div>
                            </div>
                            
                            {post.image && (
                              <div className="journal-post-image">
                                <img src={post.image} alt="Contest item" />
                              </div>
                            )}
                            
                            {post.description && (
                              <div className="journal-post-description">
                                {post.description}
                              </div>
                            )}
                          </>
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
          <p>No entries logged yet! Head over to the Log tab to start tracking your progress.</p>
        </div>
      )}
    </div>
  )
}



function SettingsModal({ darkMode, setDarkMode, onClose, onClearData }: {
  darkMode: boolean,
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>,
  onClose: () => void,
  onClearData: () => void
}) {
  const [userName, setUserName] = useState('You')
  const [notifications, setNotifications] = useState(true)

  const handleSaveSettings = () => {
    // In a real app, this would save user preferences to backend
    alert('Settings saved! (This is just a prototype)')
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      onClearData()
      alert('All data has been cleared and reset to defaults!')
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content settings-modal">
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="settings-content">
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
                  Dark mode
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3>Data</h3>
              <div className="setting-item">
                <p className="setting-description">
                  Export your contest data or clear all stored information.
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
                  Contest Platform v1.0.0<br/>
                  Built with React and TypeScript<br/>
                  Made for friendly eating competitions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button type="button" onClick={handleSaveSettings} className="btn-primary">
            💾 Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
