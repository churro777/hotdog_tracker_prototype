import { useState, useEffect } from 'react'

import type { Contest } from '@types'

export interface CountdownInfo {
  /** Time remaining in milliseconds */
  timeRemaining: number
  /** Whether the contest is currently active */
  isActive: boolean
  /** Whether the contest is completed */
  isCompleted: boolean
  /** Whether the contest hasn't started yet */
  isUpcoming: boolean
  /** Formatted time remaining string */
  formattedTime: string
  /** Status message for display */
  statusMessage: string
}

/**
 * Hook to provide countdown information for a contest
 * Updates every second and handles different contest states
 */
export const useContestCountdown = (contest: Contest | null): CountdownInfo => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!contest) {
    return {
      timeRemaining: 0,
      isActive: false,
      isCompleted: false,
      isUpcoming: false,
      formattedTime: '',
      statusMessage: 'No active contest',
    }
  }

  const now = currentTime.getTime()
  const startTime = contest.startDate.getTime()
  const endTime = contest.endDate.getTime()

  let timeRemaining = 0
  let isActive = false
  let isCompleted = false
  let isUpcoming = false
  let statusMessage = ''

  if (now < startTime) {
    // Contest hasn't started yet
    isUpcoming = true
    timeRemaining = startTime - now
    statusMessage = 'Contest starts in:'
  } else if (now >= startTime && now < endTime) {
    // Contest is active
    isActive = true
    timeRemaining = endTime - now
    statusMessage = 'Contest ends in:'
  } else {
    // Contest is over
    isCompleted = true
    timeRemaining = 0
    statusMessage = 'Contest ended'
  }

  const formattedTime = formatTimeRemaining(timeRemaining)

  return {
    timeRemaining,
    isActive,
    isCompleted,
    isUpcoming,
    formattedTime,
    statusMessage,
  }
}

/**
 * Format milliseconds into a human-readable time string
 */
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00:00'

  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default useContestCountdown
