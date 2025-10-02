import { useState, useEffect, useCallback, useMemo } from 'react'

import { Link } from 'react-router-dom'

import { useAuth } from '@hooks/useAuth'
import useContestCountdown from '@hooks/useContestCountdown'
import type { UserWithContestCount } from '@hooks/useContestDataV2'
import useContestLeader from '@hooks/useContestLeader'
import useContests from '@hooks/useContests'
import { useDataService } from '@hooks/useDataService'
import useIsAdmin from '@hooks/useIsAdmin'
import useTheme from '@hooks/useTheme'
import type { Contest } from '@types'

import FlaggedPostsTab from './admin/FlaggedPostsTab'
import DebugBanner from './DebugBanner'
import './AdminPage.css'

interface ContestFormData {
  name: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  status: 'upcoming' | 'active' | 'completed'
  isDefault: boolean
}

const AdminPage = () => {
  const { currentUser } = useAuth()
  const {
    dataService,
    posts,
    users,
    getFlaggedPosts,
    clearPostFlags,
    deletePost,
    syncContestScores,
  } = useDataService()
  const { isAdmin, loading: adminLoading, error: adminError } = useIsAdmin()
  const { isDarkMode, toggleTheme } = useTheme()
  const { activeContest } = useContests()
  const countdown = useContestCountdown(activeContest)

  // Calculate contest-specific user counts
  const usersWithContestCount: UserWithContestCount[] = useMemo(() => {
    if (!activeContest || !users) return []

    const contestPosts = posts.filter(
      post => post.contestId === activeContest.id
    )

    return users.map(user => {
      const userContestPosts = contestPosts.filter(
        post => post.userId === user.id
      )
      const contestCount = userContestPosts.reduce(
        (sum, post) => sum + (post.count ?? 0),
        0
      )

      return {
        ...user,
        contestCount,
      }
    })
  }, [users, posts, activeContest])

  const { leader, isTied, tiedCount } = useContestLeader(usersWithContestCount)

  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingContest, setEditingContest] = useState<Contest | null>(null)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    updated: number
    errors: string[]
  } | null>(null)

  const [formData, setFormData] = useState<ContestFormData>({
    name: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    status: 'upcoming',
    isDefault: false,
  })

  // Utility functions for date/time handling
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0] ?? ''
  }

  const formatTimeForInput = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const combineDateAndTime = (date: string, time: string): Date => {
    return new Date(`${date}T${time}:00`)
  }

  const loadContests = useCallback(async () => {
    try {
      setLoading(true)
      const contestsData = await dataService.getContests()
      setContests(contestsData)
    } catch (err) {
      setError('Failed to load contests')
      console.error('Error loading contests:', err)
    } finally {
      setLoading(false)
    }
  }, [dataService])

  useEffect(() => {
    void loadContests()
  }, [loadContests])

  const handleCreateContest = async () => {
    if (!currentUser) return

    try {
      const contestData = {
        name: formData.name,
        description: formData.description,
        startDate: combineDateAndTime(formData.startDate, formData.startTime),
        endDate: combineDateAndTime(formData.endDate, formData.endTime),
        status: formData.status,
        isDefault: formData.isDefault,
        createdAt: new Date(),
        createdBy: currentUser.uid,
      }

      await dataService.addContest(contestData)
      await loadContests()
      resetForm()
      setShowCreateForm(false)
    } catch (err) {
      setError('Failed to create contest')
      console.error('Error creating contest:', err)
    }
  }

  const handleUpdateContest = async () => {
    if (!editingContest) return

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        startDate: combineDateAndTime(formData.startDate, formData.startTime),
        endDate: combineDateAndTime(formData.endDate, formData.endTime),
        status: formData.status,
        isDefault: formData.isDefault,
      }

      await dataService.updateContest(editingContest.id, updates)
      await loadContests()
      resetForm()
      setEditingContest(null)
    } catch (err) {
      setError('Failed to update contest')
      console.error('Error updating contest:', err)
    }
  }

  const handleDeleteContest = async (contestId: string) => {
    if (!confirm('Are you sure you want to delete this contest?')) return

    try {
      await dataService.deleteContest(contestId)
      await loadContests()
    } catch (err) {
      setError('Failed to delete contest')
      console.error('Error deleting contest:', err)
    }
  }

  const startEditing = (contest: Contest) => {
    setEditingContest(contest)
    setFormData({
      name: contest.name,
      description: contest.description ?? '',
      startDate: formatDateForInput(contest.startDate),
      startTime: formatTimeForInput(contest.startDate),
      endDate: formatDateForInput(contest.endDate),
      endTime: formatTimeForInput(contest.endDate),
      status: contest.status,
      isDefault: contest.isDefault ?? false,
    })
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '17:00',
      status: 'upcoming',
      isDefault: false,
    })
  }

  const cancelEditing = () => {
    setEditingContest(null)
    setShowCreateForm(false)
    resetForm()
  }

  // Helper functions for quick contest setup
  const setQuickDuration = (hours: number) => {
    if (!formData.startDate || !formData.startTime) return

    const startDateTime = combineDateAndTime(
      formData.startDate,
      formData.startTime
    )
    const endDateTime = new Date(
      startDateTime.getTime() + hours * 60 * 60 * 1000
    )

    setFormData({
      ...formData,
      endDate: formatDateForInput(endDateTime),
      endTime: formatTimeForInput(endDateTime),
    })
  }

  const setTomorrowStart = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    setFormData({
      ...formData,
      startDate: formatDateForInput(tomorrow),
      endDate: formatDateForInput(tomorrow),
    })
  }

  const handleSyncScores = async () => {
    setSyncLoading(true)
    setSyncResult(null)

    try {
      const result = await syncContestScores()
      setSyncResult(result)
    } catch {
      setSyncResult({ updated: 0, errors: ['Failed to sync scores'] })
    } finally {
      setSyncLoading(false)
    }
  }

  // Loading state while checking admin status
  if (adminLoading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>🛠️ Contest Administration</h1>
          <Link to="/" className="back-link">
            ← Back to App
          </Link>
        </div>
        <div className="auth-required">
          <p>Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Show error if admin check failed
  if (adminError) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>⚠️ Authorization Error</h1>
          <Link to="/" className="back-link">
            ← Back to App
          </Link>
        </div>
        <div className="auth-required">
          <p>Failed to verify admin permissions: {adminError}</p>
          <Link to="/" className="sign-in-btn">
            Go to Main App
          </Link>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!currentUser) {
    return (
      <div className={`admin-page ${!currentUser ? 'guest-mode' : ''}`}>
        <div className="admin-header">
          <h1>🔐 Sign In Required</h1>
          <Link to="/" className="back-link">
            ← Back to App
          </Link>
        </div>
        <div className="auth-required">
          <p>Please sign in to access the admin panel.</p>
          <Link to="/" className="sign-in-btn">
            Go to Main App
          </Link>
        </div>
      </div>
    )
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>🚫 Access Denied</h1>
          <Link to="/" className="back-link">
            ← Back to App
          </Link>
        </div>
        <div className="auth-required">
          <p>You do not have admin privileges to access this page.</p>
          <p>Contact an administrator if you believe this is an error.</p>
          <Link to="/" className="sign-in-btn">
            Go to Main App
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <DebugBanner />
      <div className="admin-header">
        <h1>🛠️ Contest Administration</h1>
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <Link to="/" className="back-link">
            ← Back to Main App
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Current Contest Section */}
      <div className="current-contest-section">
        <h2>📋 Current Contest</h2>
        {activeContest ? (
          <div className="current-contest-card">
            <div className="contest-header">
              <div className="contest-title">
                <h3>{activeContest.name}</h3>
                <span className={`status-badge ${activeContest.status}`}>
                  {activeContest.status}
                </span>
                {activeContest.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              <div className="contest-status">
                <div className="countdown-display">
                  <span className="countdown-label">
                    {countdown.statusMessage}
                  </span>
                  {!countdown.isCompleted && (
                    <span className="countdown-time">
                      {countdown.formattedTime}
                    </span>
                  )}
                  {countdown.isContestOver && leader && (
                    <span className="contest-winner">
                      Contest Winner: {leader.displayName}!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {activeContest.description && (
              <p className="contest-description">{activeContest.description}</p>
            )}

            <div className="contest-details">
              <div className="contest-dates">
                <div className="date-item">
                  <strong>Start:</strong>{' '}
                  {activeContest.startDate.toLocaleDateString()}{' '}
                  {activeContest.startDate.toLocaleTimeString()}
                </div>
                <div className="date-item">
                  <strong>End:</strong>{' '}
                  {activeContest.endDate.toLocaleDateString()}{' '}
                  {activeContest.endDate.toLocaleTimeString()}
                </div>
              </div>

              {leader && (
                <div className="leader-display">
                  <strong>Current Leader:</strong>{' '}
                  <span className="leader-name">
                    {isTied ? `${tiedCount}-way tie: ` : ''}
                    {leader.displayName} ({leader.totalCount})
                  </span>
                </div>
              )}
            </div>

            <div className="contest-actions">
              <button
                onClick={() => startEditing(activeContest)}
                className="edit-btn"
              >
                Edit Current Contest
              </button>
            </div>
          </div>
        ) : (
          <div className="no-contest">
            <p>No active contest found.</p>
            <p>Create a contest or mark one as the default contest.</p>
          </div>
        )}
      </div>

      <div className="admin-content">
        <div className="admin-actions">
          <button
            onClick={() => setShowCreateForm(true)}
            className="create-btn"
            disabled={showCreateForm}
          >
            + Create New Contest
          </button>
        </div>

        {showCreateForm && (
          <div className="contest-form">
            <h3>{editingContest ? 'Edit Contest' : 'Create New Contest'}</h3>

            <div className="form-group">
              <label>Contest Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., October 2025 Practice Contest"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional contest description"
                rows={3}
              />
            </div>

            {/* Quick setup buttons */}
            <div className="form-group">
              <label>Quick Setup</label>
              <div className="quick-setup-buttons">
                <button
                  type="button"
                  onClick={setTomorrowStart}
                  className="quick-btn"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(1)}
                  className="quick-btn"
                  disabled={!formData.startDate}
                >
                  1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(2)}
                  className="quick-btn"
                  disabled={!formData.startDate}
                >
                  2 Hours
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(8)}
                  className="quick-btn"
                  disabled={!formData.startDate}
                >
                  8 Hours
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | 'upcoming'
                        | 'active'
                        | 'completed',
                    })
                  }
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={e =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                  />
                  Default Contest
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={() => {
                  if (editingContest) {
                    void handleUpdateContest()
                  } else {
                    void handleCreateContest()
                  }
                }}
                className="save-btn"
                disabled={
                  !formData.name ||
                  !formData.startDate ||
                  !formData.startTime ||
                  !formData.endDate ||
                  !formData.endTime
                }
              >
                {editingContest ? 'Update Contest' : 'Create Contest'}
              </button>
              <button onClick={cancelEditing} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="contests-list">
          {(() => {
            // Filter out the current/active contest from the list
            const otherContests = contests.filter(
              contest => !activeContest || contest.id !== activeContest.id
            )
            return (
              <>
                <h3>Other Contests ({otherContests.length})</h3>

                {loading ? (
                  <div className="loading">Loading contests...</div>
                ) : otherContests.length === 0 ? (
                  <div className="no-contests">
                    {contests.length === 0 ? (
                      <>
                        <p>No contests created yet.</p>
                        <p>
                          Use the "Create New Contest" button to get started!
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          All contests are currently active or there are no
                          other contests.
                        </p>
                        <p>
                          Create additional contests using the button above.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="contests-grid">
                    {otherContests.map(contest => (
                      <div
                        key={contest.id}
                        className={`contest-card ${contest.status}`}
                      >
                        <div className="contest-header">
                          <h4>{contest.name}</h4>
                          {contest.isDefault && (
                            <span className="default-badge">Default</span>
                          )}
                          <span className={`status-badge ${contest.status}`}>
                            {contest.status}
                          </span>
                        </div>

                        {contest.description && (
                          <p className="contest-description">
                            {contest.description}
                          </p>
                        )}

                        <div className="contest-dates">
                          <div>
                            <strong>Start:</strong>{' '}
                            {contest.startDate.toLocaleDateString()}{' '}
                            {contest.startDate.toLocaleTimeString()}
                          </div>
                          <div>
                            <strong>End:</strong>{' '}
                            {contest.endDate.toLocaleDateString()}{' '}
                            {contest.endDate.toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="contest-actions">
                          <button
                            onClick={() => startEditing(contest)}
                            className="edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDeleteContest(contest.id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>

        {/* Contest Management Section */}
        <div className="contest-management-section">
          <h2>🏆 Contest Management</h2>

          {/* Current Contest Info */}
          {activeContest && (
            <div className="current-contest-info">
              <h3>Current Contest: {activeContest.name}</h3>
              <div className="contest-stats">
                <p>
                  <strong>Status:</strong> {activeContest.status}
                </p>
                <p>
                  <strong>Participants:</strong> {users?.length || 0} users
                </p>
                {countdown && (
                  <p>
                    <strong>Time:</strong> {countdown.formattedTime}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Participants List */}
          <div className="participants-section">
            <div className="participants-header">
              <h3>📊 Contest Participants</h3>
              <button
                onClick={() => void handleSyncScores()}
                disabled={syncLoading}
                className="sync-button"
              >
                {syncLoading ? '🔄 Syncing...' : '🔄 Sync Scores'}
              </button>
            </div>

            {/* Sync Results */}
            {syncResult && (
              <div
                className={`sync-result ${syncResult.errors.length > 0 ? 'error' : 'success'}`}
              >
                {syncResult.errors.length > 0 ? (
                  <>
                    <p>❌ Sync failed: {syncResult.errors.join(', ')}</p>
                  </>
                ) : (
                  <p>✅ Sync complete: {syncResult.updated} scores updated</p>
                )}
              </div>
            )}

            {/* Participants Table */}
            <div className="participants-table">
              <div className="table-header">
                <span>Rank</span>
                <span>User</span>
                <span>Total Score</span>
                <span>Status</span>
              </div>

              {users && users.length > 0 ? (
                [...users]
                  .sort((a, b) => b.totalCount - a.totalCount)
                  .map((user, index) => (
                    <div key={user.id} className="table-row">
                      <span className="rank">#{index + 1}</span>
                      <span className="user-name">{user.displayName}</span>
                      <span className="score">{user.totalCount} 🌭</span>
                      <span className="status">
                        {user.id === currentUser?.uid
                          ? '👤 You'
                          : '👥 Participant'}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="no-participants">
                  <p>No participants yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flagged Posts Section */}
        <div className="flagged-posts-section">
          <h2>🐟 Post Moderation</h2>
          <FlaggedPostsTab
            onGetFlaggedPosts={getFlaggedPosts}
            onClearFlags={clearPostFlags}
            onDeletePost={deletePost}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminPage
