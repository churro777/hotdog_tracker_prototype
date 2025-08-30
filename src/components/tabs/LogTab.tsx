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
import { isMobileDevice } from '@utils/deviceDetection'

interface LogTabProps {
  onAddPost: (
    count: number,
    description?: string,
    image?: string
  ) => Promise<boolean>
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
  isContestOver?: boolean
}

function LogTab({ onAddPost, setActiveTab, isContestOver }: LogTabProps) {
  const [newPostCount, setNewPostCount] = useState<string>(
    LIMITS.DEFAULT_ITEM_COUNT.toString()
  )
  const [newPostDescription, setNewPostDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const {
    imagePreview,
    handleImageUpload,
    handleCameraCapture,
    handlePhotoLibrary,
    clearImage,
    resetFileInput,
  } = useImageUpload()

  const isMobile = isMobileDevice()

  // Debug wrapper for photo library
  const handlePhotoLibraryDebug = () => {
    setDebugInfo('Photo library clicked...')
    handlePhotoLibrary()
  }

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

      {isContestOver ? (
        <div className="contest-over-message">
          <h3>Contest Over!</h3>
          <p>The contest has ended and no more entries can be logged.</p>
          <p>
            You can still review your entries in the Journal tab and see the
            results in the Feed and Leaderboard.
          </p>
        </div>
      ) : (
        <form
          onSubmit={e => {
            void handleSubmitPost(e)
          }}
          className="post-form"
        >
          <div className="form-section">
            {isMobile ? (
              <>
                <label className="image-upload-label">
                  {ICONS.CAMERA} Photo
                </label>
                <div className="mobile-photo-buttons">
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="photo-button camera-button"
                  >
                    {ICONS.CAMERA} Camera
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoLibraryDebug}
                    className="photo-button library-button"
                  >
                    {ICONS.FOLDER} Library
                  </button>
                </div>
              </>
            ) : (
              <>
                <label
                  htmlFor="log-image-upload"
                  className="image-upload-label"
                >
                  {ICONS.CAMERA} {FORM_CONFIG.LABELS.UPLOAD_PICTURE}
                </label>
                <input
                  id="log-image-upload"
                  type="file"
                  accept={FORM_CONFIG.INPUT_TYPES.IMAGE_ACCEPT}
                  onChange={handleImageUpload}
                  className="image-upload-input"
                />
              </>
            )}
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
            {isMobile && debugInfo && (
              <div
                style={{
                  background: '#ffeb3b',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                Debug: {debugInfo}
              </div>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="log-count">
              {FORM_CONFIG.LABELS.ITEMS_CONSUMED}
            </label>
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

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : BUTTON_TEXT.LOG_ENTRY}
          </button>
        </form>
      )}
    </div>
  )
}

export default memo(LogTab)
