import { useState, memo, useEffect } from 'react'

import './SettingsModal.css'
import ThemeSelector from '@components/ThemeSelector'
import { UI_TEXT, FORM_CONFIG, BUTTON_TEXT, ICONS, LIMITS } from '@constants'
import { useAuth } from '@hooks/useAuth'
import useLocalStorage from '@hooks/useLocalStorage'

interface SettingsModalProps {
  onClose: () => void
  onClearData: () => void
}

function SettingsModal({ onClose, onClearData }: SettingsModalProps) {
  const { currentUser, updateDisplayName } = useAuth()
  const [userName, setUserName] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [debugMode, setDebugMode] = useLocalStorage('debugMode', false)

  // Initialize userName with current user's display name
  useEffect(() => {
    if (currentUser?.displayName) {
      setUserName(currentUser.displayName)
    }
  }, [currentUser])

  const handleSaveSettings = async () => {
    if (!currentUser) return

    setIsUpdatingName(true)
    setUpdateError('')

    try {
      // Only update display name if it has changed
      if (userName.trim() !== currentUser.displayName) {
        await updateDisplayName(userName.trim())
      }
      alert(UI_TEXT.MESSAGES.SETTINGS_SAVED)
      onClose()
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : 'Failed to update settings'
      )
    } finally {
      setIsUpdatingName(false)
    }
  }

  const handleClearData = () => {
    if (confirm(UI_TEXT.MESSAGES.CONFIRM_CLEAR_DATA)) {
      onClearData()
      alert(UI_TEXT.MESSAGES.DATA_CLEARED)
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
          <h2>{ICONS.SETTINGS} Settings</h2>
          <button className="modal-close-btn" onClick={onClose}>
            {ICONS.CLOSE}
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-sections">
            <div className="settings-section">
              <h3>Profile</h3>
              <div className="setting-item">
                <label htmlFor="username">
                  {FORM_CONFIG.LABELS.DISPLAY_NAME}
                </label>
                <input
                  id="username"
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="settings-input"
                  placeholder={FORM_CONFIG.PLACEHOLDERS.NAME}
                  disabled={isUpdatingName}
                  maxLength={LIMITS.DISPLAY_NAME_MAX_LENGTH}
                />
                <div className="input-helper">
                  <span
                    className={`character-count ${userName.length >= LIMITS.DISPLAY_NAME_MAX_LENGTH ? 'limit-reached' : ''}`}
                  >
                    {userName.length}/{LIMITS.DISPLAY_NAME_MAX_LENGTH}{' '}
                    characters
                  </span>
                </div>
                {updateError && (
                  <div className="error-message">{updateError}</div>
                )}
              </div>
            </div>

            <div className="settings-section">
              <h3>Preferences</h3>
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={e => setNotifications(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {FORM_CONFIG.LABELS.ENABLE_NOTIFICATIONS}
                </label>
              </div>

              <div className="setting-item">
                <ThemeSelector />
              </div>

              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={debugMode}
                    onChange={e => setDebugMode(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Debug Mode
                </label>
                <p className="setting-description">
                  Shows contest name, authentication status, and admin
                  privileges in the banner
                </p>
              </div>
            </div>

            <div className="settings-section">
              <h3>Data</h3>
              <div className="setting-item">
                <p className="setting-description">
                  Export your contest data or clear all stored information.
                </p>
                <div className="setting-buttons">
                  <button
                    className="settings-button secondary"
                    onClick={() => alert(UI_TEXT.MESSAGES.EXPORT_COMING_SOON)}
                  >
                    {BUTTON_TEXT.EXPORT_DATA}
                  </button>
                  <button
                    className="settings-button danger"
                    onClick={handleClearData}
                  >
                    {BUTTON_TEXT.CLEAR_ALL_DATA}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>About</h3>
              <div className="setting-item">
                <p className="setting-description">
                  Contest Platform v1.0.0
                  <br />
                  Built with React and TypeScript
                  <br />
                  Made for friendly eating competitions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            {BUTTON_TEXT.CLOSE}
          </button>
          <button
            type="button"
            onClick={() => void handleSaveSettings()}
            className="btn-primary"
            disabled={isUpdatingName}
          >
            {isUpdatingName ? 'Saving...' : BUTTON_TEXT.SAVE_SETTINGS}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(SettingsModal)
