import { useState, useEffect, useCallback } from 'react'

import { Link } from 'react-router-dom'

import { useAuth } from '@hooks/useAuth'
import { useDataService } from '@hooks/useDataService'
import useTheme from '@hooks/useTheme'
import type { Contest } from '@types'
import './AdminPage.css'

interface ContestFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'completed'
  isDefault: boolean
}

const AdminPage = () => {
  const { currentUser } = useAuth()
  const { dataService } = useDataService()
  const { isDarkMode, toggleTheme } = useTheme()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingContest, setEditingContest] = useState<Contest | null>(null)

  const [formData, setFormData] = useState<ContestFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    isDefault: false,
  })

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
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
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
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
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
      startDate: contest.startDate.toISOString().slice(0, 16),
      endDate: contest.endDate.toISOString().slice(0, 16),
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
      endDate: '',
      status: 'upcoming',
      isDefault: false,
    })
  }

  const cancelEditing = () => {
    setEditingContest(null)
    setShowCreateForm(false)
    resetForm()
  }

  if (!currentUser) {
    return (
      <div className={`admin-page ${!currentUser ? 'guest-mode' : ''}`}>
        <div className="admin-header">
          <h1>🔐 Admin Access Required</h1>
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

  return (
    <div className="admin-page">
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

            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={e =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
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
                  !formData.name || !formData.startDate || !formData.endDate
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
          <h3>Existing Contests ({contests.length})</h3>

          {loading ? (
            <div className="loading">Loading contests...</div>
          ) : contests.length === 0 ? (
            <div className="no-contests">
              <p>No contests created yet.</p>
              <p>Use the "Create New Contest" button to get started!</p>
            </div>
          ) : (
            <div className="contests-grid">
              {contests.map(contest => (
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
                    <p className="contest-description">{contest.description}</p>
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
        </div>
      </div>
    </div>
  )
}

export default AdminPage
