import { useState, memo } from 'react'

import './LogTab.css'
import {
  UI_TEXT,
  CSS_CLASSES,
  FORM_CONFIG,
  LIMITS,
  BUTTON_TEXT,
  ICONS,
  TAB_TYPES,
} from '@constants'
import useImageUpload from '@hooks/useImageUpload'
import type { Tab } from '@types'

interface LogTabProps {
  onAddPost: (
    count: number,
    description?: string,
    image?: string
  ) => Promise<boolean>
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
}

function LogTab({ onAddPost, setActiveTab }: LogTabProps) {
  const [newPostCount, setNewPostCount] = useState<string>(
    LIMITS.DEFAULT_ITEM_COUNT.toString()
  )
  const [newPostDescription, setNewPostDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { imagePreview, handleImageUpload, clearImage, resetFileInput } =
    useImageUpload()

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const count = parseInt(newPostCount) ?? LIMITS.DEFAULT_ITEM_COUNT

      // Log submission details for debugging
      console.log('🚀 Submitting post:', {
        count,
        hasDescription: !!newPostDescription,
        hasImage: !!imagePreview,
        imageSize: imagePreview?.length ?? 0,
        timestamp: new Date().toISOString(),
      })

      const success = await onAddPost(
        count,
        newPostDescription ?? undefined,
        imagePreview ?? undefined
      )

      if (success) {
        console.log('✅ Post submitted successfully')
        // Reset form
        setNewPostCount(LIMITS.DEFAULT_ITEM_COUNT.toString())
        setNewPostDescription('')
        clearImage()
        resetFileInput('log-image-upload')

        // Switch to Feed tab to show the new post
        setActiveTab(TAB_TYPES.FEED)
      } else {
        console.error('❌ Post submission failed - success was false')
        alert(
          'Failed to save post. Please check your connection and try again.'
        )
      }
    } catch (error) {
      console.error('❌ Post submission error:', error)
      alert('An error occurred while saving your post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={CSS_CLASSES.TAB_PANEL}>
      <h2>{UI_TEXT.TABS.LOG} Entry</h2>

      <form
        onSubmit={e => {
          void handleSubmitPost(e)
        }}
        className="post-form"
      >
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
              <img
                src={imagePreview}
                alt={FORM_CONFIG.ALT_TEXT.CONTEST_ITEM_PREVIEW}
              />
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
            onChange={e => setNewPostCount(e.target.value)}
            className="count-input"
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="log-description">
            {FORM_CONFIG.LABELS.DESCRIPTION_OPTIONAL}
          </label>
          <textarea
            id="log-description"
            value={newPostDescription}
            onChange={e => setNewPostDescription(e.target.value)}
            placeholder={FORM_CONFIG.PLACEHOLDERS.DESCRIPTION}
            className="description-input"
            rows={LIMITS.TEXTAREA_ROWS_MEDIUM}
          />
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : BUTTON_TEXT.LOG_ENTRY}
        </button>
      </form>
    </div>
  )
}

export default memo(LogTab)
