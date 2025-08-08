import { useState, memo } from 'react'

import './SettingsModal.css'
import { UI_TEXT, FORM_CONFIG, BUTTON_TEXT, ICONS } from '@constants'

interface SettingsModalProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onClose: () => void
  onClearData: () => void
}

function SettingsModal({
  isDarkMode,
  onToggleTheme,
  onClose,
  onClearData,
}: SettingsModalProps) {
  const [userName, setUserName] = useState('You')
  const [notifications, setNotifications] = useState(true)

  const handleSaveSettings = () => {
    // In a real app, this would save user preferences to backend
    alert(UI_TEXT.MESSAGES.SETTINGS_SAVED)
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
                    onChange={e => setNotifications(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  {FORM_CONFIG.LABELS.ENABLE_NOTIFICATIONS}
                </label>
              </div>

              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={onToggleTheme}
                  />
                  <span className="checkmark"></span>
                  {FORM_CONFIG.LABELS.DARK_MODE}
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
            onClick={handleSaveSettings}
            className="btn-primary"
          >
            {BUTTON_TEXT.SAVE_SETTINGS}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(SettingsModal)
