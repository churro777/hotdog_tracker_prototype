import { useState } from 'react'
import './LogTab.css'
import type { Tab } from '../../types'
import useImageUpload from '../../hooks/useImageUpload'
import { UI_TEXT, CSS_CLASSES, FORM_CONFIG, LIMITS, BUTTON_TEXT, ICONS, TAB_TYPES } from '../../constants'

interface LogTabProps {
  onAddPost: (count: number, description?: string, image?: string) => void
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
}

function LogTab({ 
  onAddPost, 
  setActiveTab
}: LogTabProps) {
  const [newPostCount, setNewPostCount] = useState<string>(LIMITS.DEFAULT_ITEM_COUNT.toString())
  const [newPostDescription, setNewPostDescription] = useState<string>('')
  const { imagePreview, handleImageUpload, clearImage, resetFileInput } = useImageUpload()


  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    
    const count = parseInt(newPostCount) || LIMITS.DEFAULT_ITEM_COUNT
    onAddPost(count, newPostDescription || undefined, imagePreview || undefined)

    // Reset form
    setNewPostCount(LIMITS.DEFAULT_ITEM_COUNT.toString())
    setNewPostDescription('')
    clearImage()
    resetFileInput('log-image-upload')
    
    // Switch to Feed tab to show the new post
    setActiveTab(TAB_TYPES.FEED)
  }

  return (
    <div className={CSS_CLASSES.TAB_PANEL}>
      <h2>{UI_TEXT.TABS.LOG} Entry</h2>
      
      <form onSubmit={handleSubmitPost} className="post-form">
        <div className="form-section">
          <label htmlFor="log-image-upload" className="image-upload-label">
            {ICONS.CAMERA} {FORM_CONFIG.LABELS.UPLOAD_PICTURE}
          </label>
          <input
            id="log-image-upload"
            type="file"
            accept={FORM_CONFIG.INPUT_TYPES.IMAGE_ACCEPT}
            onChange={handleImageUpload}
            className="image-upload-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt={FORM_CONFIG.ALT_TEXT.CONTEST_ITEM_PREVIEW} />
              <button 
                type="button" 
                onClick={clearImage}
                className="remove-image"
              >
                {BUTTON_TEXT.REMOVE}
              </button>
            </div>
          )}
        </div>

        <div className="form-section">
          <label htmlFor="log-count">{FORM_CONFIG.LABELS.ITEMS_CONSUMED}</label>
          <input
            id="log-count"
            type="number"
            min={LIMITS.MIN_ITEM_COUNT}
            max={LIMITS.MAX_ITEM_COUNT}
            value={newPostCount}
            onChange={(e) => setNewPostCount(e.target.value)}
            className="count-input"
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="log-description">{FORM_CONFIG.LABELS.DESCRIPTION_OPTIONAL}</label>
          <textarea
            id="log-description"
            value={newPostDescription}
            onChange={(e) => setNewPostDescription(e.target.value)}
            placeholder={FORM_CONFIG.PLACEHOLDERS.DESCRIPTION}
            className="description-input"
            rows={LIMITS.TEXTAREA_ROWS_MEDIUM}
          />
        </div>

        <button type="submit" className="submit-button">
          {BUTTON_TEXT.LOG_ENTRY}
        </button>
      </form>
    </div>
  )
}

export default LogTab