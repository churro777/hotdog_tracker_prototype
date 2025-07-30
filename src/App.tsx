import { useState, useEffect } from 'react'
import './App.css'

type View = 'home' | 'contest'
type Tab = 'leaderboard' | 'feed' | 'log' | 'journal'

type Contest = {
  id: string
  name: string
  description?: string
  type: string // e.g., 'Hot Dog Eating', 'Pizza Eating', etc.
  hostId: string
  hostName: string
  participants: string[] // user IDs
  createdAt: Date
  endDate?: Date
  isActive: boolean
  emoji: string
}

type User = {
  id: string
  name: string
  avatar?: string
}

type ContestPost = {
  id: string
  contestId: string
  userId: string
  userName: string
  count: number
  image?: string
  timestamp: Date
  description?: string
}

type ContestUser = {
  id: string
  contestId: string
  userId: string
  userName: string
  totalCount: number
}

function App() {
  const [currentView, setCurrentView] = useState<View>('home')
  const [activeTab, setActiveTab] = useState<Tab>('leaderboard')
  const [currentContestId, setCurrentContestId] = useState<string | null>(null)
  
  const [contests, setContests] = useState<Contest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [contestPosts, setContestPosts] = useState<ContestPost[]>([])
  const [contestUsers, setContestUsers] = useState<ContestUser[]>([])
  const [darkMode, setDarkMode] = useState<boolean>(false)
  
  const currentUserId = '1' // This would come from auth in a real app

  const defaultUsers: User[] = [
    { id: '1', name: 'You' },
    { id: '2', name: 'Joey Chestnut' },
    { id: '3', name: 'Takeru Kobayashi' },
    { id: '4', name: 'Matt Stonie' },
    { id: '5', name: 'Your Friend' }
  ]

  const defaultContests: Contest[] = [
    {
      id: 'contest-1',
      name: 'Hot Dog Contest July 2025',
      description: 'Annual hot dog eating contest',
      type: 'Hot Dog Eating',
      hostId: '1',
      hostName: 'You',
      participants: ['1', '2', '3', '4', '5'],
      createdAt: new Date(),
      isActive: true,
      emoji: '🌭'
    }
  ]

  const defaultContestUsers: ContestUser[] = [
    { id: 'cu-1', contestId: 'contest-1', userId: '2', userName: 'Joey Chestnut', totalCount: 23 },
    { id: 'cu-2', contestId: 'contest-1', userId: '3', userName: 'Takeru Kobayashi', totalCount: 18 },
    { id: 'cu-3', contestId: 'contest-1', userId: '4', userName: 'Matt Stonie', totalCount: 15 },
    { id: 'cu-4', contestId: 'contest-1', userId: '1', userName: 'You', totalCount: 3 },
    { id: 'cu-5', contestId: 'contest-1', userId: '5', userName: 'Your Friend', totalCount: 7 }
  ]

  const defaultContestPosts: ContestPost[] = [
    {
      id: '1',
      contestId: 'contest-1', 
      userId: '2', 
      userName: 'Joey Chestnut', 
      count: 5, 
      timestamp: new Date(), 
      description: 'Just crushed 5 more! 🌭'
    }
  ]

  useEffect(() => {
    // Load contests
    const savedContests = localStorage.getItem('contest-platform-contests')
    if (savedContests) {
      try {
        const parsedContests = JSON.parse(savedContests).map((contest: any) => ({
          ...contest,
          createdAt: new Date(contest.createdAt),
          endDate: contest.endDate ? new Date(contest.endDate) : undefined
        }))
        setContests(parsedContests)
      } catch (error) {
        console.error('Error parsing contests:', error)
        setContests(defaultContests)
      }
    } else {
      setContests(defaultContests)
    }

    // Load users
    const savedUsers = localStorage.getItem('contest-platform-users')
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
    const savedPosts = localStorage.getItem('contest-platform-posts')
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts).map((post: any) => ({
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
    const savedContestUsers = localStorage.getItem('contest-platform-contest-users')
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
    if (contests.length > 0) {
      localStorage.setItem('contest-platform-contests', JSON.stringify(contests))
    }
  }, [contests])

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('contest-platform-users', JSON.stringify(users))
    }
  }, [users])

  useEffect(() => {
    if (contestPosts.length > 0) {
      localStorage.setItem('contest-platform-posts', JSON.stringify(contestPosts))
    }
  }, [contestPosts])

  useEffect(() => {
    if (contestUsers.length > 0) {
      localStorage.setItem('contest-platform-contest-users', JSON.stringify(contestUsers))
    }
  }, [contestUsers])

  // Set page title based on environment and current view
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    let title = 'Contest Platform'
    
    if (currentView === 'contest' && currentContestId) {
      const contest = contests.find(c => c.id === currentContestId)
      if (contest) {
        title = `${contest.emoji} ${contest.name}`
      }
    }
    
    if (isLocal) {
      title = `DEBUG - ${title}`
    }
    
    document.title = title
  }, [currentView, currentContestId, contests])

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
          user.contestId === post.contestId && user.userId === post.userId
            ? { ...user, totalCount: user.totalCount - oldCount + newCount }
            : user
        ))
        
        return updatedPost
      }
      return post
    }))
  }

  const handleContestSelect = (contestId: string) => {
    setCurrentContestId(contestId)
    setCurrentView('contest')
    setActiveTab('leaderboard')
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setCurrentContestId(null)
  }

  const renderTabContent = () => {
    if (!currentContestId) return <div>Select a contest</div>
    
    const currentContest = contests.find(c => c.id === currentContestId)
    const contestPostsForContest = contestPosts.filter(p => p.contestId === currentContestId)
    const contestUsersForContest = contestUsers.filter(u => u.contestId === currentContestId)
    
    switch (activeTab) {
      case 'leaderboard':
        return <LeaderboardTab contestUsers={contestUsersForContest} contest={currentContest} />
      case 'feed':
        return <FeedTab posts={contestPostsForContest} onEditPost={handleEditPost} currentUserId={currentUserId} contest={currentContest} />
      case 'log':
        return <LogTab 
          contestId={currentContestId}
          contestPosts={contestPosts}
          setContestPosts={setContestPosts} 
          contestUsers={contestUsers}
          setContestUsers={setContestUsers}
          currentUserId={currentUserId}
          setActiveTab={setActiveTab}
          contest={currentContest}
        />
      case 'journal':
        return <JournalTab 
          posts={contestPostsForContest} 
          currentUserId={currentUserId} 
          onEditPost={handleEditPost} 
        />
      default:
        return <LeaderboardTab contestUsers={contestUsersForContest} contest={currentContest} />
    }
  }

  const renderContent = () => {
    if (currentView === 'home') {
      return <HomePage 
        contests={contests}
        currentUserId={currentUserId}
        onContestSelect={handleContestSelect}
        onCreateContest={() => {/* TODO: implement */}}
      />
    }
    
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
    if (currentView === 'home') {
      return (
        <div className="header-content">
          <h1>Contest Platform</h1>
          <button 
            className="settings-btn"
            onClick={() => {/* TODO: Settings modal */}}
          >
            ⚙️
          </button>
        </div>
      )
    }
    
    const currentContest = contests.find(c => c.id === currentContestId)
    return (
      <div className="header-content">
        <button className="back-btn" onClick={handleBackToHome}>
          ☰
        </button>
        <h1>{currentContest ? `${currentContest.emoji} ${currentContest.name}` : 'Contest'}</h1>
        <button 
          className="settings-btn"
          onClick={() => {/* TODO: Settings modal */}}
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
    </div>
  )
}

function HomePage({ contests, currentUserId, onContestSelect, onCreateContest }: {
  contests: Contest[],
  currentUserId: string,
  onContestSelect: (contestId: string) => void,
  onCreateContest: () => void
}) {
  const hostedContests = contests.filter(c => c.hostId === currentUserId)
  const enteredContests = contests.filter(c => c.participants.includes(currentUserId) && c.hostId !== currentUserId)

  return (
    <div className="homepage">
      <div className="contest-sections">
        {/* Your Contests */}
        <div className="contest-section">
          <div className="section-header">
            <h2>Your Contests</h2>
            <button className="create-contest-btn" onClick={onCreateContest}>
              + Create Contest
            </button>
          </div>
          <div className="contest-grid">
            {hostedContests.map(contest => (
              <ContestCard 
                key={contest.id}
                contest={contest}
                onClick={() => onContestSelect(contest.id)}
              />
            ))}
            {hostedContests.length === 0 && (
              <div className="empty-state">
                <p>No contests created yet</p>
                <button className="create-first-contest" onClick={onCreateContest}>
                  Create your first contest
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Entered Contests */}
        <div className="contest-section">
          <h2>Entered Contests</h2>
          <div className="contest-grid">
            {enteredContests.map(contest => (
              <ContestCard 
                key={contest.id}
                contest={contest}
                onClick={() => onContestSelect(contest.id)}
              />
            ))}
            {enteredContests.length === 0 && (
              <div className="empty-state">
                <p>You haven't entered any contests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContestCard({ contest, onClick }: { contest: Contest, onClick: () => void }) {
  return (
    <div className="contest-card" onClick={onClick}>
      <div className="contest-emoji">{contest.emoji}</div>
      <div className="contest-info">
        <h3>{contest.name}</h3>
        <p>{contest.type}</p>
        <div className="contest-meta">
          <span>{contest.participants.length} participants</span>
          <span className={`contest-status ${contest.isActive ? 'active' : 'inactive'}`}>
            {contest.isActive ? 'Active' : 'Ended'}
          </span>
        </div>
      </div>
    </div>
  )
}

function LeaderboardTab({ contestUsers, contest }: { 
  contestUsers: ContestUser[], 
  contest: Contest | undefined 
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
          const itemType = contest?.type.toLowerCase().includes('hot dog') ? 'hot dogs' : 'items'
          return (
            <div key={user.id} className={`leaderboard-item ${rank <= 3 ? 'top-three' : ''}`}>
              <div className="rank">
                {getRankEmoji(rank)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.userName}</div>
                <div className="user-score">{user.totalCount} {itemType}</div>
              </div>
              <div className="hot-dog-count">
                {contest?.emoji || '🏆'} {user.totalCount}
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
  contestPosts, 
  setContestPosts, 
  contestUsers, 
  setContestUsers, 
  currentUserId, 
  setActiveTab,
  contest
}: { 
  contestId: string,
  contestPosts: ContestPost[],
  setContestPosts: React.Dispatch<React.SetStateAction<ContestPost[]>>,
  contestUsers: ContestUser[],
  setContestUsers: React.Dispatch<React.SetStateAction<ContestUser[]>>,
  currentUserId: string,
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>,
  contest: Contest | undefined
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
    
    const currentContestUser = contestUsers.find(u => u.contestId === contestId && u.userId === currentUserId)
    if (!currentContestUser) return

    const newPost: ContestPost = {
      id: Date.now().toString(),
      contestId: contestId,
      userId: currentUserId,
      userName: currentContestUser.userName,
      count: parseInt(newPostCount) || 1,
      image: imagePreview || undefined,
      timestamp: new Date(),
      description: newPostDescription || undefined
    }

    setContestPosts(prev => [newPost, ...prev])
    
    setContestUsers(prev => prev.map(user => 
      user.contestId === contestId && user.userId === currentUserId
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

function FeedTab({ posts, onEditPost, currentUserId, contest }: { 
  posts: ContestPost[],
  onEditPost: (postId: string, newCount: number, newDescription?: string) => void,
  currentUserId: string,
  contest: Contest | undefined
}) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editCount, setEditCount] = useState<string>('1')
  const [editDescription, setEditDescription] = useState<string>('')

  const startEditing = (post: ContestPost) => {
    setEditingPostId(post.id)
    setEditCount(post.count.toString())
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
  return (
    <div className="tab-panel">
      <h2>📰 Contest Feed</h2>
      
      <div className="posts-section">
        <div className="posts-list">
          {posts.map(post => (
            <div key={post.id} className="post-item">
              {editingPostId === post.id ? (
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
                      {post.userId === currentUserId && (
                        <button onClick={() => startEditing(post)} className="edit-post-btn">✏️</button>
                      )}
                    </div>
                  </div>
                  
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Contest item" />
                    </div>
                  )}
                  
                  <div className="post-content">
                    <div className="post-count">
                      {contest?.emoji || '🏆'} <strong>{post.count}</strong> {contest?.type.includes('Hot Dog') ? `hot dog${post.count !== 1 ? 's' : ''} eaten!` : `item${post.count !== 1 ? 's' : ''} consumed!`}
                    </div>
                    {post.description && (
                      <div className="post-description">{post.description}</div>
                    )}
                  </div>
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

  const userPosts = posts.filter(post => post.userId === currentUserId)
  const totalHotDogs = userPosts.reduce((sum, post) => sum + post.count, 0)
  const averagePerPost = userPosts.length > 0 ? (totalHotDogs / userPosts.length).toFixed(1) : 0
  const bestDay = userPosts.length > 0 ? Math.max(...userPosts.map(post => post.count)) : 0

  const startEditing = (post: ContestPost) => {
    setEditingPostId(post.id)
    setEditCount(post.count.toString())
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
            const dayTotal = dayPosts.reduce((sum, post) => sum + post.count, 0)
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
                                  📝 {post.count}
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

function SettingsTab({ darkMode, setDarkMode, onClearData }: { 
  darkMode: boolean,
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>,
  onClearData: () => void 
}) {
  const [userName, setUserName] = useState('You')
  const [notifications, setNotifications] = useState(true)

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
      
      <div className="settings-header">
        <button className="settings-button primary" onClick={handleSaveSettings}>
          💾 Save Settings
        </button>
      </div>
      
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
  )
}

export default App
