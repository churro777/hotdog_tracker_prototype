import { useState } from 'react'
import './SettingsModal.css'

interface SettingsModalProps {
  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
  onClearData: () => void
}

function SettingsModal({ darkMode, setDarkMode, onClose, onClearData }: SettingsModalProps) {
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

export default SettingsModal