import './DebugBanner.css'
import { useAuth } from '@hooks/useAuth'
import useContests from '@hooks/useContests'
import useIsAdmin from '@hooks/useIsAdmin'
import useLocalStorage from '@hooks/useLocalStorage'
import useResponsiveLayout from '@hooks/useResponsiveLayout'

/**
 * Debug banner component that shows development information
 * Only visible when debug mode is enabled in settings
 */
function DebugBanner() {
  const [debugMode] = useLocalStorage('debugMode', false)
  const { currentUser } = useAuth()
  const { activeContest } = useContests()
  const { isAdmin } = useIsAdmin()
  const currentLayout = useResponsiveLayout()

  // Don't render if debug mode is disabled
  if (!debugMode) {
    return null
  }

  return (
    <div className="debug-banner">
      <div className="debug-banner-content">
        <div className="debug-section">
          <span className="debug-label">Contest:</span>
          <span className="debug-value">
            {activeContest?.name ?? 'No active contest'}
          </span>
        </div>

        <div className="debug-section">
          <span className="debug-label">Auth:</span>
          <span className="debug-value">
            {currentUser
              ? `✅ ${currentUser.displayName ?? 'User'}`
              : '❌ Guest'}
          </span>
        </div>

        <div className="debug-section">
          <span className="debug-label">Admin:</span>
          <span className="debug-value">{isAdmin ? '🛠️ Yes' : '❌ No'}</span>
        </div>

        <div className="debug-section">
          <span className="debug-label">Layout:</span>
          <span className="debug-value">
            {currentLayout === 'Mobile'
              ? '📱'
              : currentLayout === 'Tablet'
                ? '📋'
                : '💻'}{' '}
            {currentLayout}
          </span>
        </div>

        <div className="debug-section">
          <span className="debug-label">Mode:</span>
          <span className="debug-value">🔧 DEBUG</span>
        </div>
      </div>
    </div>
  )
}

export default DebugBanner
