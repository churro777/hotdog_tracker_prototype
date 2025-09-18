import { memo } from 'react'

import './ConstdogtutionTab.css'
import useContests from '@hooks/useContests'

function ConstdogtutionTab() {
  const { activeContest } = useContests()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  return (
    <div className="constdogtution-tab">
      <div className="constdogtution-header">
        <h1>📜 The Const-dog-tution</h1>
        <p className="constdogtution-subtitle">
          The Official Rules & Regulations of the Hot Dog Eating Contest
        </p>
      </div>

      <div className="constdogtution-content">
        {/* Contest Period Section */}
        {activeContest && (
          <section className="rule-section contest-period">
            <h2>🗓️ Contest Period</h2>
            <div className="contest-dates">
              <div className="date-item">
                <strong>Start:</strong> {formatDate(activeContest.startDate)}
              </div>
              <div className="date-item">
                <strong>End:</strong> {formatDate(activeContest.endDate)}
              </div>
            </div>
            <p className="rule-text">
              All hot dog consumption entries must be logged within this
              official contest period. No pre-logging or post-contest entries
              will be counted.
            </p>
          </section>
        )}

        {/* Hot Dog Definition */}
        <section className="rule-section">
          <h2>🌭 What Counts as a Hot Dog</h2>
          <div className="rule-list">
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <span className="rule-text">
                <strong>Complete Unit:</strong> One hot dog = whole frankfurter
                + whole bun
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✅</span>
              <span className="rule-text">
                <strong>Must be dubbed "Hot Dog":</strong> Product must be
                specifically labeled or sold as a "hot dog"
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <span className="rule-text">
                <strong>No substitutes:</strong> Bratwurst, Italian sausage,
                chorizo, or other sausages don't count
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">❌</span>
              <span className="rule-text">
                <strong>No partial counts:</strong> Must consume the entire hot
                dog and bun to count as 1
              </span>
            </div>
          </div>
        </section>

        {/* Consumption Rules */}
        <section className="rule-section">
          <h2>🍽️ Consumption & Logging Rules</h2>
          <div className="rule-list">
            <div className="rule-item">
              <span className="rule-icon">📝</span>
              <span className="rule-text">
                <strong>Log everything:</strong> All hot dog consumption must be
                logged in the app
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">📷</span>
              <span className="rule-text">
                <strong>Photos encouraged:</strong> Pictures are not required
                but highly recommended for verification
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">⏱️</span>
              <span className="rule-text">
                <strong>Log promptly:</strong> Entries should be logged within a
                reasonable time of consumption
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">✏️</span>
              <span className="rule-text">
                <strong>Edits allowed:</strong> You can edit entries, but edit
                timestamps are tracked
              </span>
            </div>
          </div>
        </section>

        {/* Fair Play Rules */}
        <section className="rule-section">
          <h2>⚖️ Fair Play & Integrity</h2>
          <div className="rule-list">
            <div className="rule-item">
              <span className="rule-icon">🤝</span>
              <span className="rule-text">
                <strong>Honor system:</strong> Be honest in your logging - this
                is for fun!
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">👤</span>
              <span className="rule-text">
                <strong>One person, one account:</strong> No sharing accounts or
                assistance from others
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🚫</span>
              <span className="rule-text">
                <strong>No assistance:</strong> You must consume the hot dogs
                yourself, unassisted
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🔍</span>
              <span className="rule-text">
                <strong>Admin review:</strong> Questionable entries may be
                reviewed by contest administrators
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🐟</span>
              <span className="rule-text">
                <strong>Report fishy posts:</strong> Use the fishy button to
                report suspicious or questionable entries for admin review
              </span>
            </div>
          </div>
        </section>

        {/* Health & Safety */}
        <section className="rule-section">
          <h2>🏥 Health & Safety</h2>
          <div className="rule-list">
            <div className="rule-item">
              <span className="rule-icon">💧</span>
              <span className="rule-text">
                <strong>Stay hydrated:</strong> Drink plenty of water,
                especially between hot dogs
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">⚠️</span>
              <span className="rule-text">
                <strong>Don't risk choking:</strong> Safety over speed - chew
                thoroughly
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🛑</span>
              <span className="rule-text">
                <strong>Know your limits:</strong> Stop if you feel unwell -
                this is supposed to be fun!
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🌡️</span>
              <span className="rule-text">
                <strong>Temperature matters:</strong> Hot dogs should be
                consumed at room temperature or warmer
              </span>
            </div>
          </div>
        </section>

        {/* Contest Conduct */}
        <section className="rule-section">
          <h2>🎯 Contest Conduct</h2>
          <div className="rule-list">
            <div className="rule-item">
              <span className="rule-icon">⏰</span>
              <span className="rule-text">
                <strong>Reasonable timeframe:</strong> Consume each hot dog
                within a reasonable period (not over hours)
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🍴</span>
              <span className="rule-text">
                <strong>Normal preparation:</strong> Standard condiments and
                preparation methods are allowed
              </span>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🏆</span>
              <span className="rule-text">
                <strong>Leaderboard ranking:</strong> Winners determined by
                total hot dog count during contest period
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="constdogtution-footer">
          <p>
            <strong>Remember:</strong> This contest is all about having fun and
            enjoying some delicious hot dogs! Play fair, stay safe, and may the
            best eater win! 🏆🌭
          </p>
          <p className="amendment-note">
            📜{' '}
            <em>
              These rules may be amended by contest administrators as needed to
              ensure fair play and safety.
            </em>
          </p>
        </section>
      </div>
    </div>
  )
}

export default memo(ConstdogtutionTab)
