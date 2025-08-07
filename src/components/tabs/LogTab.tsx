import { useState } from 'react'
import './LogTab.css'
import type { Tab } from '../../types'
import useImageUpload from '../../hooks/useImageUpload'

interface LogTabProps {
  onAddPost: (count: number, description?: string, image?: string) => void
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
}

function LogTab({ 
  onAddPost, 
  setActiveTab
}: LogTabProps) {
  const [newPostCount, setNewPostCount] = useState<string>('1')
  const [newPostDescription, setNewPostDescription] = useState<string>('')
  const { imagePreview, handleImageUpload, clearImage, resetFileInput } = useImageUpload()


  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    
    const count = parseInt(newPostCount) || 1
    onAddPost(count, newPostDescription || undefined, imagePreview || undefined)

    // Reset form
    setNewPostCount('1')
    setNewPostDescription('')
    clearImage()
    resetFileInput('log-image-upload')
    
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
                onClick={clearImage}
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