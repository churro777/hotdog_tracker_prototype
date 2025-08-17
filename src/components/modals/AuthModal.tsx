import { useState, useEffect } from 'react'

import { CSS_CLASSES, FORM_CONFIG, LIMITS } from '@constants'
import { useAuth } from '@hooks/useAuth'
import './AuthModal.css'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
}

type AuthMode = 'signin' | 'signup'

const AuthModal = ({
  isOpen,
  onClose,
  initialMode = 'signup',
}: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const {
    signup,
    login,
    loginWithGoogle,
    loginWithTwitter,
    loginWithApple,
    resetPassword,
  } = useAuth()

  // Reset mode when modal opens with new initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      resetForm()
    }
  }, [isOpen, initialMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          throw new Error('Display name is required')
        }
        await signup(email, password, displayName.trim())
      } else {
        await login(email, password)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setError('')
    setShowResetForm(false)
    setResetEmailSent(false)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email)
      setResetEmailSent(true)
    } catch {
      // Use generic message for security - don't reveal if user exists
      setError(
        "If an account with that email exists, we've sent you a password reset link."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (
    provider: 'google' | 'twitter' | 'apple'
  ) => {
    setError('')
    setLoading(true)

    try {
      switch (provider) {
        case 'google':
          await loginWithGoogle()
          break
        case 'twitter':
          await loginWithTwitter()
          break
        case 'apple':
          await loginWithApple()
          break
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={CSS_CLASSES.MODAL.BACKDROP} onClick={onClose}>
      <div
        className={CSS_CLASSES.MODAL.CONTENT}
        onClick={e => e.stopPropagation()}
      >
        <div className={CSS_CLASSES.MODAL.HEADER}>
          <h2>
            {showResetForm
              ? 'Reset Password'
              : mode === 'signup'
                ? 'Join the Contest!'
                : 'Welcome Back!'}
          </h2>
          <button
            className={CSS_CLASSES.MODAL.CLOSE_BTN}
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {showResetForm ? (
          // Password Reset Form
          resetEmailSent ? (
            <div className="reset-success">
              <h3>Check Your Email</h3>
              <p>
                If an account with that email exists, we've sent you a password
                reset link. Please check your email and click the link to reset
                your password.
              </p>
              <button
                type="button"
                className={CSS_CLASSES.FORM.BUTTON_PRIMARY}
                onClick={() => setShowResetForm(false)}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form
              onSubmit={e => {
                void handlePasswordReset(e)
              }}
            >
              <div className={CSS_CLASSES.FORM.SECTION}>
                <label htmlFor="reset-email">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={CSS_CLASSES.FORM.INPUT}
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className={CSS_CLASSES.MODAL.FOOTER}>
                <button
                  type="submit"
                  className={CSS_CLASSES.FORM.BUTTON_PRIMARY}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowResetForm(false)}
                  disabled={loading}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )
        ) : (
          // Normal Auth Form
          <form
            onSubmit={e => {
              void handleSubmit(e)
            }}
          >
            {mode === 'signup' && (
              <div className={CSS_CLASSES.FORM.SECTION}>
                <label htmlFor="displayName">
                  {FORM_CONFIG.LABELS.DISPLAY_NAME}
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder={FORM_CONFIG.PLACEHOLDERS.NAME}
                  className={CSS_CLASSES.FORM.INPUT}
                  required
                  disabled={loading}
                  maxLength={LIMITS.DISPLAY_NAME_MAX_LENGTH}
                />
              </div>
            )}

            <div className={CSS_CLASSES.FORM.SECTION}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={CSS_CLASSES.FORM.INPUT}
                required
                disabled={loading}
              />
            </div>

            <div className={CSS_CLASSES.FORM.SECTION}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={CSS_CLASSES.FORM.INPUT}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {mode === 'signin' && (
              <div className="forgot-password-link">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowResetForm(true)}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className={CSS_CLASSES.MODAL.FOOTER}>
              <button
                type="submit"
                className={CSS_CLASSES.FORM.BUTTON_PRIMARY}
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'signup'
                    ? 'Join Contest'
                    : 'Sign In'}
              </button>
            </div>

            <div className="social-divider">
              <span>or</span>
            </div>

            <div className="social-buttons">
              <button
                type="button"
                className="social-btn google-btn"
                onClick={() => {
                  void handleSocialLogin('google')
                }}
                disabled={loading}
              >
                Continue with Google
              </button>

              {/* Twitter authentication temporarily disabled due to Firebase compatibility issues */}
              {/* <button
            type="button"
            className="social-btn twitter-btn"
            onClick={() => {
              void handleSocialLogin('twitter')
            }}
            disabled={loading}
          >
            Continue with Twitter
          </button> */}

              {/* Apple authentication disabled - requires Apple Developer account setup */}
              {/* <button
            type="button"
            className="social-btn apple-btn"
            onClick={() => {
              void handleSocialLogin('apple')
            }}
            disabled={loading}
          >
            Continue with Apple
          </button> */}
            </div>

            <div className="auth-switch">
              {mode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => switchMode('signin')}
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  New to the contest?{' '}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => switchMode('signup')}
                    disabled={loading}
                  >
                    Join now
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthModal
