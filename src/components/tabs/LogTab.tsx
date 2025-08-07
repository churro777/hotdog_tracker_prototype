import { useState } from 'react'
import './LogTab.css'
import type { Tab, ContestPost, ContestUser } from '../../types'

interface LogTabProps {
  contestId: string
  setContestPosts: React.Dispatch<React.SetStateAction<ContestPost[]>>
  contestUsers: ContestUser[]
  setContestUsers: React.Dispatch<React.SetStateAction<ContestUser[]>>
  currentUserId: string
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
}

function LogTab({ 
  contestId, 
  setContestPosts, 
  contestUsers, 
  setContestUsers, 
  currentUserId, 
  setActiveTab
}: LogTabProps) {
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

export default LogTab